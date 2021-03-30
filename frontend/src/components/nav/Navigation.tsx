import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Header } from "./Header";
import Dashboard from "../dashboard/Dashboard";
import Settings from "../settings/Settings";
import CallHistory from "../history/CallHistory";

export const Navigation = (props: { userName: String }) => {
  return (
    <BrowserRouter>
      <Header userName={props.userName} />
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/history" component={CallHistory} />
        <Route path="/search" component={Dashboard} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </BrowserRouter>
  );
};
