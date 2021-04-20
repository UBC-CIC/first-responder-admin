import { Spinner, Alert } from "react-bootstrap";

export const Loading = (props: { show: boolean }) => {
  return (
    <Alert variant="light" show={props.show}>
      Searching ...
      <Spinner animation="grow" variant="primary" />
      <Spinner animation="grow" variant="secondary" />
      <Spinner animation="grow" variant="success" />
      <Spinner animation="grow" variant="danger" />
      <Spinner animation="grow" variant="warning" />
      <Spinner animation="grow" variant="info" />
    </Alert>
  );
};

export default Loading;
