import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { urlBase } from '../config';
import { createApplicationHubConnection } from '../lib/hubFactory';
import * as relayAPI from '../lib/relay';
import { connect, disconnect } from '../lib/server';
import * as session from '../lib/session';
import { isPassthroughEnabled } from '../lib/token';
import {
  type ApplicationState,
  type ConnectionWatchdogState,
  type RelayControllerState,
  type ServerState,
  type UserState,
} from '../types';
import AppContext from './AppContext';
import Browse from './Browse/Browse';
import Chat from './Chat/Chat';
import LoginForm from './LoginForm';
import Rooms from './Rooms/Rooms';
import Searches from './Search/Searches';
import ErrorSegment from './Shared/ErrorSegment';
import System from './System/System';
import Transfers from './Transfers/Transfers';
import UIConfigContext from './UIConfigContext';
import Users from './Users/Users';
import { Component } from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import {
  Button,
  Header,
  Icon,
  Loader,
  Menu,
  Modal,
  Segment,
  type SemanticCOLORS,
  type SemanticICONS,
  Sidebar,
} from 'semantic-ui-react';

const initialState = {
  applicationOptions: {} as Record<string, unknown>,
  applicationState: {} as ApplicationState,
  error: false,
  initialized: false,
  login: {
    error: undefined as unknown,
    pending: false,
  },
  retriesExhausted: false,
};

const ModeSpecificConnectButton = ({
  connectionWatchdog,
  controller = {},
  isHorizontal,
  mode,
  pendingReconnect,
  server,
  user,
}: {
  readonly connectionWatchdog: ConnectionWatchdogState;
  readonly controller: RelayControllerState;
  readonly isHorizontal: boolean;
  readonly mode: unknown;
  readonly pendingReconnect: unknown;
  readonly server: ServerState;
  readonly user: UserState;
}) => {
  if (mode === 'Agent') {
    const isConnected = controller?.state === 'Connected';
    const isTransitioning = ['Connecting', 'Reconnecting'].includes(
      controller?.state ?? '',
    );

    return (
      <Menu.Item
        onClick={() =>
          isConnected ? relayAPI.disconnect() : relayAPI.connect()
        }
      >
        <Icon.Group className="menu-icon-group">
          <Icon
            color={
              controller?.state === 'Connected'
                ? 'green'
                : isTransitioning
                  ? 'yellow'
                  : 'grey'
            }
            name="plug"
          />
          {!isConnected && (
            <Icon
              className="menu-icon-no-shadow"
              color="red"
              corner="bottom right"
              name="close"
            />
          )}
        </Icon.Group>
        Controller {controller?.state}
      </Menu.Item>
    );
  } else {
    if (server?.isConnected) {
      return (
        <Menu.Item onClick={() => disconnect()}>
          <Icon.Group className="menu-icon-group">
            <Icon
              color={pendingReconnect ? 'yellow' : 'green'}
              name="plug"
            />
            {user?.privileges?.isPrivileged && (
              <Icon
                className="menu-icon-no-shadow"
                color="yellow"
                corner
                name="star"
              />
            )}
          </Icon.Group>
          {isHorizontal && 'Connected'}
        </Menu.Item>
      );
    }

    // the server is disconnected, and we need to give the user some information about what the client is doing
    // options are:
    // - nothing. the client was manually disconnected, kicked off by another login, etc., and we're not trying to connect
    // - actively trying to make a connection to the server
    // - still trying to connect, but waiting for the next connection attempt
    let icon: SemanticICONS = 'close';
    let color: SemanticCOLORS = 'red';
    let label = 'Disconnected';

    if (connectionWatchdog?.isAttemptingConnection) {
      icon = 'clock';
      color = 'yellow';
      label = 'Waiting...';
    }

    // eslint-disable-next-line no-warning-comments
    // TODO: figure out why the original code had this?
    // likely just deadcode but
    // if (server?.isConnecting || server?.IsLoggingIn) {
    if (server?.isConnecting) {
      // i do not know why typescript refuses to see this
      icon = 'sync alternate loading' as SemanticICONS;
      color = 'green';
      label = 'Connecting...';
    }

    return (
      <Menu.Item onClick={() => connect()}>
        <Icon.Group className="menu-icon-group">
          <Icon
            color="grey"
            name="plug"
          />
          <Icon
            className="menu-icon-no-shadow"
            color={color}
            corner="bottom right"
            name={icon}
          />
        </Icon.Group>
        {isHorizontal && label}
      </Menu.Item>
    );
  }
};

class App extends Component<Record<string, never>, typeof initialState> {
  public constructor(props: {} | Readonly<{}>) {
    super(props);

    this.state = initialState;
  }

  public componentDidMount() {
    this.init();
  }

  public static contextType = UIConfigContext;

  public init = async () => {
    this.setState({ initialized: false }, async () => {
      try {
        const securityEnabled = await session.getSecurityEnabled();

        if (!securityEnabled) {
          console.debug('application security is not enabled, per api call');
          session.enablePassthrough();
        }

        if (await session.check()) {
          const appHub = createApplicationHubConnection();

          appHub.on('state', (state) => {
            this.setState({ applicationState: state });
          });

          appHub.on('options', (options) => {
            this.setState({ applicationOptions: options });
          });

          appHub.onreconnecting(() =>
            this.setState({ error: true, retriesExhausted: false }),
          );
          appHub.onclose(() =>
            this.setState({ error: true, retriesExhausted: true }),
          );
          appHub.onreconnected(() =>
            this.setState({ error: false, retriesExhausted: false }),
          );

          await appHub.start();
        }

        this.setState({
          error: false,
        });
      } catch (error) {
        console.error(error);
        this.setState({ error: true, retriesExhausted: true });
      } finally {
        this.setState({ initialized: true });
      }
    });
  };

  public handleLogin = (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => {
    this.setState(
      (previousState) => ({
        login: { ...previousState.login, error: undefined, pending: true },
      }),
      async () => {
        try {
          await session.login({ password, rememberMe, username });
          this.setState(
            (previousState) => ({
              login: { ...previousState.login, error: false, pending: false },
            }),
            () => this.init(),
          );
        } catch (error) {
          this.setState((previousState) => ({
            login: { ...previousState.login, error, pending: false },
          }));
        }
      },
    );
  };

  public logout = () => {
    session.logout();
    this.setState({ login: { ...initialState.login } });
  };

  public withTokenCheck = (component: React.JSX.Element): React.JSX.Element => {
    session.check(); // async, runs in the background
    return component;
  };

  public render() {
    const {
      applicationOptions = {},
      applicationState = {},
      error,
      initialized,
      login,
      retriesExhausted,
    } = this.state;
    const [config] = this.context;
    const { barPosition } = config;
    const isHorizontal = barPosition === 'top' || barPosition === 'bottom';
    const {
      connectionWatchdog = {},
      pendingReconnect,
      pendingRestart,
      relay = {},
      server,
      shares = {},
      user,
      version = {},
    } = applicationState;
    const { current, isUpdateAvailable, latest } = version;
    const { scanPending: pendingShareRescan } = shares;

    const { controller, mode } = relay;

    if (!initialized) {
      return (
        <Loader
          active
          size="big"
        />
      );
    }

    if (error) {
      return (
        <ErrorSegment
          caption={
            <>
              <span>Lost connection to slskd</span>
              <br />
              <span>
                {retriesExhausted ? 'Refresh to reconnect' : 'Retrying...'}
              </span>
            </>
          }
          icon="attention"
          suppressPrefix
        />
      );
    }

    if (!session.isLoggedIn() && !isPassthroughEnabled()) {
      return (
        <LoginForm
          error={login.error}
          // initialized={login.initialized}
          loading={login.pending}
          onLoginAttempt={this.handleLogin}
        />
      );
    }

    const isAgent = mode === 'Agent';

    return (
      <>
        <Sidebar.Pushable
          as={Segment}
          className="app"
        >
          <Sidebar
            animation="overlay"
            as={Menu}
            className={
              isHorizontal ? 'navigation-horizontal' : 'navigation-vertical'
            }
            direction={barPosition}
            height="thin"
            icon="labeled"
            inverted
            vertical={!isHorizontal}
            visible
          >
            {version.isCanary && (
              <Menu.Item>
                <Icon
                  color="yellow"
                  name="flask"
                />
                Canary
              </Menu.Item>
            )}
            {isAgent ? (
              <Menu.Item>
                <Icon name="detective" />
                Agent Mode
              </Menu.Item>
            ) : (
              <>
                <Link to={`${urlBase}/searches`}>
                  <Menu.Item>
                    <Icon name="search" />
                    Search
                  </Menu.Item>
                </Link>
                <Link to={`${urlBase}/downloads`}>
                  <Menu.Item>
                    <Icon name="download" />
                    Downloads
                  </Menu.Item>
                </Link>
                <Link to={`${urlBase}/uploads`}>
                  <Menu.Item>
                    <Icon name="upload" />
                    Uploads
                  </Menu.Item>
                </Link>
                <Link to={`${urlBase}/rooms`}>
                  <Menu.Item>
                    <Icon name="comments" />
                    Rooms
                  </Menu.Item>
                </Link>
                <Link to={`${urlBase}/chat`}>
                  <Menu.Item>
                    <Icon name="comment" />
                    Chat
                  </Menu.Item>
                </Link>
                <Link to={`${urlBase}/users`}>
                  <Menu.Item>
                    <Icon name="users" />
                    Users
                  </Menu.Item>
                </Link>
                <Link to={`${urlBase}/browse`}>
                  <Menu.Item>
                    <Icon name="folder open" />
                    Browse
                  </Menu.Item>
                </Link>
              </>
            )}
            <div className="navigation-spacer" />
            <ModeSpecificConnectButton
              connectionWatchdog={connectionWatchdog}
              controller={controller}
              isHorizontal={isHorizontal}
              mode={mode}
              pendingReconnect={pendingReconnect}
              server={server}
              user={user}
            />
            {(pendingReconnect || pendingRestart || pendingShareRescan) && (
              <Menu.Item>
                <Icon.Group className="menu-icon-group">
                  <Link to={`${urlBase}/system/info`}>
                    <Icon
                      color="yellow"
                      name="exclamation circle"
                    />
                  </Link>
                </Icon.Group>
                Pending Action
              </Menu.Item>
            )}
            {isUpdateAvailable && (
              <Modal
                centered
                closeIcon
                size="mini"
                trigger={
                  <Menu.Item>
                    <Icon.Group className="menu-icon-group">
                      <Icon
                        color="yellow"
                        name="bullhorn"
                      />
                    </Icon.Group>
                    New Version!
                  </Menu.Item>
                }
              >
                <Modal.Header>New Version!</Modal.Header>
                <Modal.Content>
                  <p>
                    {/* You are currently running version{' '} */}
                    <strong>{current}</strong>
                    while version <strong>{latest}</strong> is available.
                  </p>
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    fluid
                    href="https://github.com/slskd/slskd/releases"
                    primary
                    style={{ marginLeft: 0 }}
                  >
                    See Release Notes
                  </Button>
                </Modal.Actions>
              </Modal>
            )}
            <Link to={`${urlBase}/system`}>
              <Menu.Item>
                <Icon name="cogs" />
                System
              </Menu.Item>
            </Link>
            {session.isLoggedIn() && (
              <Modal
                actions={[
                  'Cancel',
                  {
                    content: 'Log Out',
                    key: 'done',
                    negative: true,
                    onClick: this.logout,
                  },
                ]}
                centered
                content="Are you sure you want to log out?"
                header={
                  <Header
                    content="Confirm Log Out"
                    icon="sign-out"
                  />
                }
                size="mini"
                trigger={
                  <Menu.Item>
                    <Icon name="sign-out" />
                    Log Out
                  </Menu.Item>
                }
              />
            )}
          </Sidebar>
          <Sidebar.Pusher className={`app-content app-content-${barPosition}`}>
            <AppContext.Provider
              // eslint-disable-next-line no-warning-comments
              // TODO: needs useMemo, but class component. yolo for now.
              // eslint-disable-next-line react/jsx-no-constructed-context-values
              value={{ options: applicationOptions, state: applicationState }}
            >
              {isAgent ? (
                <Switch>
                  <Route
                    path={`${urlBase}/system/:tab?`}
                    render={(props) =>
                      this.withTokenCheck(
                        <System
                          {...props}
                          options={applicationOptions}
                          state={applicationState}
                        />,
                      )
                    }
                  />
                  <Redirect
                    from="*"
                    to={`${urlBase}/system`}
                  />
                </Switch>
              ) : (
                <Switch>
                  <Route
                    path={`${urlBase}/searches/:id?`}
                    render={() =>
                      this.withTokenCheck(
                        <div className="view">
                          <Searches />
                        </div>,
                      )
                    }
                  />
                  <Route
                    path={`${urlBase}/browse`}
                    render={() => this.withTokenCheck(<Browse />)}
                  />
                  <Route
                    path={`${urlBase}/users`}
                    render={() => this.withTokenCheck(<Users />)}
                  />
                  <Route
                    path={`${urlBase}/chat`}
                    render={() =>
                      this.withTokenCheck(<Chat state={applicationState} />)
                    }
                  />
                  <Route
                    path={`${urlBase}/rooms`}
                    render={() => this.withTokenCheck(<Rooms />)}
                  />
                  <Route
                    path={`${urlBase}/uploads`}
                    render={() =>
                      this.withTokenCheck(
                        <div className="view">
                          <Transfers
                            direction="upload"
                            server={server}
                          />
                        </div>,
                      )
                    }
                  />
                  <Route
                    path={`${urlBase}/downloads`}
                    render={() =>
                      this.withTokenCheck(
                        <div className="view">
                          <Transfers
                            direction="download"
                            server={applicationState.server}
                          />
                        </div>,
                      )
                    }
                  />
                  <Route
                    path={`${urlBase}/system/:tab?`}
                    render={() =>
                      this.withTokenCheck(
                        <System
                          options={applicationOptions}
                          state={applicationState}
                        />,
                      )
                    }
                  />
                  <Redirect
                    from="*"
                    to={`${urlBase}/searches`}
                  />
                </Switch>
              )}
            </AppContext.Provider>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
        <ToastContainer
          autoClose={5_000}
          closeOnClick
          draggable={false}
          hideProgressBar={false}
          newestOnTop
          pauseOnFocusLoss
          pauseOnHover
          position="bottom-center"
          rtl={false}
        />
      </>
    );
  }
}

export default App;
