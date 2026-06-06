import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { urlBase } from '../config';
import { createApplicationHubConnection } from '../lib/hubFactory';
import * as relayAPI from '../lib/relay';
import { connect, disconnect } from '../lib/server';
import * as session from '../lib/session';
import { isPassthroughEnabled } from '../lib/token';
import {
  type ApplicationOptions,
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bot,
  CircleAlert,
  Clock,
  Download,
  FlaskConical,
  FolderOpen,
  Loader2,
  LogOut,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plug,
  Search,
  Settings,
  Star,
  Upload,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { Component } from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const initialState = {
  applicationOptions: {} as ApplicationOptions,
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

    const plugColor =
      controller?.state === 'Connected'
        ? 'text-green-500'
        : isTransitioning
          ? 'text-yellow-500'
          : 'text-gray-400';

    return (
      <div
        className="menu-item"
        onClick={() =>
          isConnected ? relayAPI.disconnect() : relayAPI.connect()
        }
      >
        <div className="menu-icon-group relative">
          <Plug className={`h-4 w-4 ${plugColor}`} />
          {!isConnected && (
            <X className="menu-icon-no-shadow absolute -bottom-1 -right-1 h-2 w-2 text-red-500" />
          )}
        </div>
        Controller {controller?.state}
      </div>
    );
  }

  if (server?.isConnected) {
    return (
      <div
        className="menu-item"
        onClick={() => disconnect()}
      >
        <div className="menu-icon-group relative">
          <Plug
            className={`h-4 w-4 ${pendingReconnect ? 'text-yellow-500' : 'text-green-500'}`}
          />
          {user?.privileges?.isPrivileged && (
            <Star className="menu-icon-no-shadow absolute -bottom-1 -right-1 h-2 w-2 text-yellow-400" />
          )}
        </div>
        {isHorizontal && 'Connected'}
      </div>
    );
  }

  let IconComponent: LucideIcon = X;
  let iconColorClass = 'text-red-500';
  let label = 'Disconnected';

  if (connectionWatchdog?.isAttemptingConnection) {
    IconComponent = Clock;
    iconColorClass = 'text-yellow-500';
    label = 'Waiting...';
  }

  if (server?.isConnecting) {
    IconComponent = Loader2;
    iconColorClass = 'text-green-500 animate-spin';
    label = 'Connecting...';
  }

  return (
    <div
      className="menu-item"
      onClick={() => connect()}
    >
      <div className="menu-icon-group relative">
        <Plug className="h-4 w-4 text-gray-400" />
        <IconComponent
          className={`menu-icon-no-shadow absolute -bottom-1 -right-1 h-2 w-2 ${iconColorClass}`}
        />
      </div>
      {isHorizontal && label}
    </div>
  );
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

  // eslint-disable-next-line react/static-property-placement
  public declare context: React.ContextType<typeof UIConfigContext>;

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
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
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
          loading={login.pending}
          onLoginAttempt={this.handleLogin}
        />
      );
    }

    const isAgent = mode === 'Agent';

    return (
      <>
        <div className="app">
          <nav
            className={
              isHorizontal ? 'navigation-horizontal' : 'navigation-vertical'
            }
          >
            {version.isCanary && (
              <div className="menu-item">
                <FlaskConical className="h-4 w-4 text-yellow-500" />
                Canary
              </div>
            )}
            {isAgent ? (
              <div className="menu-item">
                <Bot className="h-4 w-4" />
                Agent Mode
              </div>
            ) : (
              <>
                <Link to={`${urlBase}/searches`}>
                  <div className="menu-item">
                    <Search className="h-4 w-4" />
                    Search
                  </div>
                </Link>
                <Link to={`${urlBase}/downloads`}>
                  <div className="menu-item">
                    <Download className="h-4 w-4" />
                    Downloads
                  </div>
                </Link>
                <Link to={`${urlBase}/uploads`}>
                  <div className="menu-item">
                    <Upload className="h-4 w-4" />
                    Uploads
                  </div>
                </Link>
                <Link to={`${urlBase}/rooms`}>
                  <div className="menu-item">
                    <MessagesSquare className="h-4 w-4" />
                    Rooms
                  </div>
                </Link>
                <Link to={`${urlBase}/chat`}>
                  <div className="menu-item">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </div>
                </Link>
                <Link to={`${urlBase}/users`}>
                  <div className="menu-item">
                    <UsersIcon className="h-4 w-4" />
                    Users
                  </div>
                </Link>
                <Link to={`${urlBase}/browse`}>
                  <div className="menu-item">
                    <FolderOpen className="h-4 w-4" />
                    Browse
                  </div>
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
              <div className="menu-item">
                <div className="menu-icon-group relative">
                  <Link to={`${urlBase}/system/info`}>
                    <CircleAlert className="h-4 w-4 text-yellow-500" />
                  </Link>
                </div>
                Pending Action
              </div>
            )}
            {isUpdateAvailable && (
              <Dialog>
                <DialogTrigger className="menu-item">
                  <div className="menu-icon-group relative">
                    <Megaphone className="h-4 w-4 text-yellow-500" />
                  </div>
                  New Version!
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Version!</DialogTitle>
                  </DialogHeader>
                  <p>
                    <strong>{current}</strong> while version{' '}
                    <strong>{latest}</strong> is available.
                  </p>
                  <DialogFooter>
                    <Button className="w-full">
                      <a href="https://github.com/slskd/slskd/releases">
                        See Release Notes
                      </a>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Link to={`${urlBase}/system`}>
              <div className="menu-item">
                <Settings className="h-4 w-4" />
                System
              </div>
            </Link>
            {session.isLoggedIn() && (
              <Dialog>
                <DialogTrigger className="menu-item">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Log Out</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to log out?</p>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Cancel
                    </DialogClose>
                    <Button
                      // eslint-disable-next-line react/jsx-handler-names
                      onClick={this.logout}
                      variant="destructive"
                    >
                      Log Out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </nav>
          <div className={`app-content app-content-${barPosition}`}>
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
                          <Searches server={server} />
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
          </div>
        </div>
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
