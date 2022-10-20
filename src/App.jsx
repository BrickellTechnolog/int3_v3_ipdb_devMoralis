import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Account from "components/Account/Account";
import TokenPrice from "components/TokenPrice";
import ERC20Balance from "components/ERC20Balance";
import ERC20Transfers from "components/ERC20Transfers";
import DEX from "components/DEX";
import NFTBalance from "components/NFTBalance";
import Wallet from "components/Wallet";
import { Layout, Tabs } from "antd";
import "antd/dist/antd.less";
import "./style.less";
import Gamify from "components/Dashboard";
import Ramper from "components/Ramper";
import MenuItems from "./components/MenuItems";
import logo from "Logo.png";
import Shop from "components/Shop/shop";
import Chains from "components/Chains";
import Gigs from './components/Gigs/gigs';



const { Header } = Layout;


const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#000",
    marginTop: "100px",
    padding: "1px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#000",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 4px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: { 
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
      enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Layout
      style={{
        height: "103vh",
        overflow: "auto",
        background: "#0B0B0B", //background
      }}
    >
      <Router>
        <Header theme="dark" style={styles.header}>
        <img src={logo} alt="" style={{ marginLeft: "15px", marginRight: "55px", width: "60px" }}></img>
        <Account />
        <MenuItems />
          <div style={styles.headerRight}>
          <Chains />    
          </div>
        </Header>

        <div style={styles.content}>
          <Switch>
            <Route exact path="/dashboard">
              <Tabs
                defaultActiveKey="1"
                tabPosition="left">
                <Tabs.TabPane tab={<span>🏠 Home</span>} key="1">
                  <Gamify tab="home" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>🏠 Social</span>} key="2">
                  <Gamify tab="social" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>🏠 Shop</span>} key="3">
                  <Gamify tab="shop" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>🗳️ Vote</span>} key="4">
                  <Gamify tab="ipvs" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>🔥 Collect</span>} key="5">
                  <Gamify tab="runes" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>🏆 Leaderboard</span>} key="6">
                  <Gamify tab="leaderboard" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>🎁 Rewards</span>} key="7">
                  <Gamify tab="rewards" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>❤️ Donate</span>} key="8">
                  <Gamify tab="donate" />
                </Tabs.TabPane>
              </Tabs>
            </Route>
            <Route path="/wallet">
              <Wallet />
            </Route>
            <Route path="/1inch">
              <Tabs defaultActiveKey="1" style={{ alignItems: "center" }}>
                <Tabs.TabPane tab={<span>Ethereum</span>} key="1">
                  <DEX chain="eth" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>Binance Smart Chain</span>} key="2">
                  <DEX chain="bsc" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>Polygon</span>} key="3">
                  <DEX chain="polygon" />
                </Tabs.TabPane>
              </Tabs>
            </Route>
            <Route path="/erc20balance">
              <ERC20Balance />
            </Route>
            <Route path="/onramp">
              <Ramper />
            </Route>
            <Route path="/erc20transfers">
              <ERC20Transfers />
            </Route>
            <Route path="/nftBalance">
              <NFTBalance />
              </Route>
            <Route path="/shop">
              <Shop />
            </Route>
            <Route path="/gigs">
              <Gigs />
            </Route>
            <Route path="/">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/ethereum-boilerplate">
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
          </Switch>
        </div>
      </Router>
    </Layout>
  );
};

export default App;
