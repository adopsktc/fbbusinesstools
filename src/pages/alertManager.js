import React, { useState, useMemo, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import { FaRegTrashAlt } from "react-icons/fa";
import { GrFacebook } from "react-icons/gr";
import { GrRefresh } from "react-icons/gr";
import { RiCheckFill } from "react-icons/ri";
import { CgClose } from "react-icons/cg";
import { AlertOptions } from "../data/alertOptions.json";
import { AdAccounts } from "../data/adAccountData.json";
import axios from "axios";
import * as queries from "../graphql/queries";
import * as mutations from "../graphql/mutations";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "../aws-exports.js";

Amplify.configure(awsconfig);

const matchCheck = (acc, alerts) => {
  let matchCount = 0;
  for (let i = 0; i < acc.offConditions.length; i++) {
    if (
      alerts &&
      alerts.some(
        (e) =>
          e.School === acc.offConditions[i].School &&
          e.Alert === acc.offConditions[i].Alert
      )
    ) {
      matchCount++;
      if (
        acc.backOnConditions.criteria &&
        alerts.some(
          (e) =>
            e.School === acc.backOnConditions.criteria.School &&
            e.Alert === acc.backOnConditions.criteria.Alert
        ) &&
        acc.currentStatus === "On"
      ) {
        acc.backOnConditions.goesBackOn = true;
      }
      acc.currentStatus = "Off";
    }
  }
  return matchCount;
};

const matchCheckDeep = (acc, alerts) => {
  let matchCount = 0;
  let cumulativeCount = 0;
  for (let i = 0; i < acc.offConditions.length; i++) {
    for (let x = 0; x < acc.offConditions[i].length; x++) {
      if (
        alerts &&
        alerts.some(
          (e) =>
            e.School === acc.offConditions[i][x].School &&
            e.Alert === acc.offConditions[i][x].Alert
        )
      ) {
        matchCount++;
      }
    }
    if (matchCount === 2) {
      cumulativeCount++;
      if (
        acc.backOnConditions.criteria &&
        alerts.some(
          (e) =>
            e.School === acc.backOnConditions.criteria.School &&
            e.Alert === acc.backOnConditions.criteria.Alert
        ) &&
        acc.currentStatus === "On"
      ) {
        acc.backOnConditions.goesBackOn = true;
      }
      acc.currentStatus = "Off";
    }
    matchCount = 0;
  }
  return cumulativeCount;
};

const filterAccounts = (accounts, alerts) =>
  accounts.filter((f) =>
    f.offConditions.length > 2
      ? matchCheckDeep(f, alerts) >= f.minimumMatches
      : matchCheck(f, alerts) >= f.minimumMatches
  );

export default function AlertManager() {
  const accountsDeepCopy = JSON.parse(JSON.stringify(AdAccounts));

  const initialInputState = { School: "", Alert: "", Date: "" };
  const [modalShow, setModalShow] = useState(false);
  const [userInput, setUserInput] = useState(initialInputState);
  const [alertList, setAlertList] = useState([]);
  const [checkedAccounts, setCheckedAccounts] = useState();
  const mappedChecked = useMemo(
    () => checkedAccounts && checkedAccounts.map((i) => i.accountID),
    [checkedAccounts]
  );
  const [adAccounts, setAdAccounts] = useState(accountsDeepCopy);
  const filteredAccounts = useMemo(
    () => filterAccounts(adAccounts, alertList),
    [alertList, adAccounts]
  );

  // Data processing methods

  const date = new Date();
  const formattedDate = date.toDateString();

  const formatTS = (ts) => {
    let converted = new Date(parseInt(ts) * 1000);
    return converted.toDateString();
  };

  const formatSlackAlert = (text) => {
    let School = text.substr(0, text.indexOf(":")).replace(/\*/g, "");
    let Alert = text.split("Daily Status `ONHOLD` - ")[1] || "";
    if (text.indexOf("OVERCAP") !== -1)
      Alert = "Group WordTrap: Lead is OVERCAP";
    return {
      School: School,
      Alert: Alert.replace(/ *\([^)]*\) */g, "").trim(),
    };
  };

  const processFetchedData = (data) => {
    const mapped =
      data &&
      data
        .map((i) => {
          const text = formatSlackAlert(i.text);
          return {
            School: text.School,
            Alert: text.Alert,
            Date: formatTS(i.ts),
          };
        })
        .filter(
          (i) =>
            i.Date === date.toDateString() &&
            (i.Alert.indexOf("Daily") !== -1 ||
              i.Alert.indexOf("OVERCAP") !== -1)
        );
    setAlertList(mapped);
  };

  //API data pull

  const getSlackMessages = async () => {
    setModalShow(true);
    try {
      const response = await axios.get("/api/getconvo");
      return response.data.messages;
    } catch (err) {
      console.log(err);
    } finally {
      setModalShow(false);
    }
  };

  //Db DataPull

  const getCheckedAccounts = async () => {
    try {
      const list = await API.graphql(
        graphqlOperation(queries.listCheckedAccounts)
      );
      setCheckedAccounts(list.data.listCheckedAccounts.items);
    } catch (error) {
      console.log(error);
    }
  };

  //Misc utils

  const openAccountFB = (id) => {
    const styledID = id.substring(4);
    window.open(
      `https://business.facebook.com/adsmanager/manage/campaigns?act=${styledID}&business_id=1783305341923072`,
      "_blank"
    );
  };

  const addCheckedAccount = async (id) => {
    const checked = { accountID: id, id: id };
    return await API.graphql(
      graphqlOperation(mutations.createCheckedAccount, { input: checked })
    );
  };

  const removeCheckedAccount = async (id) => {
    try {
      const target = { id: id };
      return await API.graphql(
        graphqlOperation(mutations.deleteCheckedAccount, { input: target })
      );
    } catch (error) {
      console.log(error);
    }
  };

  //Event Handlers

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlertList([...alertList, userInput]);
    setUserInput(initialInputState);
  };

  const handleChangeSchool = (e) => {
    e.persist();
    setUserInput((userInput) => ({
      ...userInput,
      School: e.target.value,
      Date: formattedDate,
    }));
  };

  const handleChangeAlert = (e) => {
    e.persist();
    setUserInput((userInput) => ({ ...userInput, Alert: e.target.value }));
  };

  const handleAlertDelete = (alert) => {
    setAlertList(alertList && alertList.filter((f) => f !== alert));
    setAdAccounts(accountsDeepCopy);
  };

  const handleClear = () => {
    setAlertList([]);
    setAdAccounts(accountsDeepCopy);
    setCheckedAccounts([]);
  };

  const handleCheck = (id) => {
    if (mappedChecked.includes(id)) {
      setCheckedAccounts(checkedAccounts.filter((i) => i.id !== id));
      removeCheckedAccount(id);
    } else {
      setCheckedAccounts([...checkedAccounts, { id: id, accountID: id }]);
      addCheckedAccount(id);
    }
  };

  const handlePullMessages = async () => {
    setAlertList([]);
    processFetchedData(await getSlackMessages());
  };

  //Effects

  useEffect(() => {
    async function fetchData() {
      processFetchedData(await getSlackMessages());
      getCheckedAccounts();
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (alertList && alertList.length === 0) {
      setAdAccounts(accountsDeepCopy);
      setCheckedAccounts([]);
    }
    // eslint-disable-next-line
  }, [alertList]);

  return (
    <>
      <Card className="mainCardAlerts" text="white">
        <Card.Header>
          <Row className="d-flex justify-content-between">
            <Col xs="auto">
              <h4>Alert Manager</h4>
            </Col>
            <Col xs="auto">
              <Row>
                <Col className="px-1">
                  <Button
                    onClick={handlePullMessages}
                    className="mb-2"
                    variant="info"
                  >
                    <GrRefresh />
                  </Button>
                </Col>
                <Col className="px-1">
                  <Button
                    onClick={handleClear}
                    disabled={alertList && !alertList.length}
                    className="mb-2"
                    variant="danger"
                  >
                    <FaRegTrashAlt />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="mt-3">
            <Col xs="12">
              <Form onSubmit={handleSubmit}>
                <Form.Row className="align-items-center">
                  <Col md="3" xs="auto">
                    <Form.Label srOnly />
                    <Form.Control
                      className="mb-2"
                      as="select"
                      placeholder="School Name"
                      name="School Name"
                      value={userInput.School}
                      onChange={handleChangeSchool}
                    >
                      <option hidden>Select School Name</option>
                      {AlertOptions.Schools &&
                        AlertOptions.Schools.map((i, index) => (
                          <option key={index} value={i}>
                            {i}
                          </option>
                        ))}
                    </Form.Control>
                  </Col>
                  <Col md="3" xs="auto">
                    <Form.Control
                      className="mb-2"
                      as="select"
                      placeholder="Alert Message"
                      name="Alert Message"
                      value={userInput.Alert}
                      onChange={handleChangeAlert}
                    >
                      <option hidden>Select Alert Type</option>
                      {AlertOptions.Alerts &&
                        AlertOptions.Alerts.map((i, index) => (
                          <option key={index} value={i}>
                            {i}
                          </option>
                        ))}
                    </Form.Control>
                  </Col>
                  <Col xs="auto">
                    <Button
                      disabled={!(userInput.School && userInput.Alert)}
                      type="submit"
                      className="mb-2"
                    >
                      Add
                    </Button>
                  </Col>
                </Form.Row>
              </Form>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col lg="6" xs="12">
              <Card bg="dark" text="white">
                <Card.Header as="h5">Alerts</Card.Header>
                <Card.Body>
                  <ListGroup>
                    {alertList &&
                      alertList.map((i, index) => (
                        <ListGroup.Item
                          className="d-flex align-items-center"
                          variant="dark"
                          key={index}
                        >
                          <div className="flex-grow-1">
                            <Card.Subtitle>{i.School}</Card.Subtitle>
                            <Card.Text>
                              {i.Alert} <br />
                              <small className="text-muted">{i.Date}</small>
                            </Card.Text>
                          </div>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleAlertDelete(i)}
                          >
                            <FaRegTrashAlt />
                          </Button>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col lg="6" xs="12">
              <Card bg="dark" text="white">
                <Card.Header as="h5">Affected Accounts</Card.Header>
                <Card.Body>
                  {filteredAccounts &&
                    filteredAccounts.map((i) => (
                      <Card
                        bg={
                          mappedChecked.includes(i.id) ? "success" : "secondary"
                        }
                        text="white"
                        key={i.id}
                      >
                        <Card.Header className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <Card.Subtitle>
                              {i.name}, should be turned off.
                            </Card.Subtitle>
                            <Card.Text>
                              {i.backOnConditions.goesBackOn
                                ? `Those campaigns should be turned back on at: ${i.backOnConditions.time}`
                                : "Those campaigns should not go back on"}
                            </Card.Text>
                          </div>
                          <Button
                            variant="primary"
                            onClick={() => openAccountFB(i.id)}
                            className="text-right, align-top"
                          >
                            <GrFacebook />
                          </Button>
                          {mappedChecked.includes(i.id) ? (
                            <Button
                              variant="outline-danger"
                              className="ml-2"
                              onClick={() => handleCheck(i.id)}
                            >
                              <CgClose />
                            </Button>
                          ) : (
                            <Button
                              variant="outline-success"
                              className="ml-2"
                              onClick={() => handleCheck(i.id)}
                            >
                              <RiCheckFill />
                            </Button>
                          )}
                        </Card.Header>
                      </Card>
                    ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Modal show={modalShow} backdrop="static" keyboard={false}>
        <Modal.Body>Getting Alerts...</Modal.Body>
      </Modal>
    </>
  );
}
