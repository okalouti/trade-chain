import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";

import trade_json from "./contracts/Trade.json";
const truffleTrade = require("truffle-contract")(trade_json);

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: "#3f51b5",
    color: theme.palette.common.white,
    fontSize: 21
  },
  body: {
    fontSize: 14
  }
}))(TableCell);

const styles = theme => ({
  root: {
    width: "60%",
    display: "flex",
    flexDirection: "column"
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: "20px"
  },
  currentAddress: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    marginLeft: "30px",
    marginTop: "20px"
  },
  table: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    marginLeft: "45px",
    marginRight: "45px",
    overflowX: "auto"
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default
    }
  }
});

class ContractDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: ""
    };
  }
  tick = () => {
    this.setState({
      account: this.props.drizzle.web3.eth.accounts.givenProvider
        .selectedAddress
    });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleClick = name => event => {
    switch (name) {
      case "fund":
        this.fundContract();
        break;
      case "dispatch":
        this.dispatchCargo();
        break;
      case "redeem":
        this.redeemFunds();
        break;
      default:
        return;
    }
  };

  fundContract = async () => {
    const { drizzle, selectedTrade, quantity, price } = this.props;
    await drizzle.web3.eth.sendTransaction({
      from: drizzle.web3.eth.accounts.givenProvider.selectedAddress,
      to: selectedTrade,
      value: drizzle.web3.utils.toWei((quantity * price).toString(), "ether")
    });
    // .then(res => {
    //   if (res.status) alert("Contract is funded.");
    // })
    // .catch(err => {
    //   if (err.message.includes("Only buyer can call this")) {
    //     alert("Only buyer can seed contract.");
    //   }
    // });
  };

  dispatchCargo = async () => {
    const { drizzle, selectedTrade } = this.props;
    const provider = drizzle.web3.givenProvider;
    truffleTrade.setProvider(provider);
    const contract = await truffleTrade.at(selectedTrade);
    await contract.dispatchCargo({
      from: drizzle.web3.eth.accounts.givenProvider.selectedAddress
    });
  };

  redeemFunds = async () => {
    const { drizzle, selectedTrade } = this.props;
    const provider = drizzle.web3.givenProvider;
    truffleTrade.setProvider(provider);
    const contract = await truffleTrade.at(selectedTrade);
    await contract.sendFunds({
      from: drizzle.web3.eth.accounts.givenProvider.selectedAddress
    });
  };

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      classes,
      selectedTrade,
      buyer,
      seller,
      carrier,
      quantity,
      price,
      balance,
      contractState
    } = this.props;

    const addressMapping = {
      [buyer.toLowerCase()]: "BUYER",
      [carrier.toLowerCase()]: "CARRIER",
      [seller.toLowerCase()]: "SELLER"
    };

    return (
      <div className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>Contract Display</CustomTableCell>
              <CustomTableCell align="right">
                <Button variant="contained">
                  Connected: {addressMapping[this.state.account]}
                </Button>
                {/* {" "}
                Connected:
                {addressMapping[this.state.account]} */}
              </CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Contract Address
              </CustomTableCell>
              <CustomTableCell align="right">{selectedTrade}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Buyer
              </CustomTableCell>
              <CustomTableCell align="right">{buyer}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Seller
              </CustomTableCell>
              <CustomTableCell align="right">{seller}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Carrier
              </CustomTableCell>
              <CustomTableCell align="right">{carrier}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Quantity
              </CustomTableCell>
              <CustomTableCell align="right">{quantity}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Price
              </CustomTableCell>
              <CustomTableCell align="right">{price}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Contract Balance
              </CustomTableCell>
              <CustomTableCell align="right">{balance}</CustomTableCell>
            </TableRow>
            <TableRow className={classes.row}>
              <CustomTableCell component="th" scope="row">
                Contract Status
              </CustomTableCell>
              <CustomTableCell align="right">{contractState}</CustomTableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className={classes.buttons}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={this.handleClick("fund")}
          >
            Fund (Buyer)
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={this.handleClick("dispatch")}
          >
            Dispatch (Carrier)
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={this.handleClick("redeem")}
          >
            Redeem (Seller)
          </Button>
        </div>
      </div>
    );
  }
}

ContractDisplay.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ContractDisplay);
