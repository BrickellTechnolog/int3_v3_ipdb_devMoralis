import { Typography, Tag, Button, Table, Space, Card, Modal } from "antd";
import { FireFilled } from "@ant-design/icons";
import Runes from "../Runes.png";
import RunesCollected from "../RunesCollected.png";
import Mages from "../Mages.png";
import Hoodie from "../Hoodie.png";
import Blockie from "./Blockie";
import { getEllipsisTxt } from "helpers/formatters";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import moment from "moment";
import useCollectors from "hooks/useCollectors";
import { useState, useEffect } from "react";


const { Title } = Typography;

const styles = {
  collected: {
    marginTop: "20px",
    marginBottom: "40px",
    width: "310px",
    height: "150px",
    background: "#F500D0",
    borderRadius: "20px",
    display: "flex",
    overflow: "hidden",
  },
  colHeading: {
    padding: "27px",
    fontSize: "12px",
    width: "200px",
  },
  count: {
    fontSize: "28px",
    fontWeight: "600",
    marginTop: "5px",
  },
  daily: {
    marginTop: "20px",
    marginBottom: "35px",
    display: "flex",
    justifyContent: "space-between",
  },
  rew: {
    marginTop: "20px",
    marginBottom: "35px",
    display: "flex",
    gap: "35px",
    flexWrap: "wrap",
  },
  collect: {
    background: "#F500D0",
    borderColor: "#F500D0",
    width: "150px",
  },
  cantCollect: {
    background: "#F500D0",
    borderColor: "#F500D0",
    width: "150px",
  },
  claimrow: {
    display: "flex",
    gap: "25px",
    marginBottom: "35px",
    flexWrap: "wrap",
  },
  rewardCard: {
    width: "310px",
    height: "400px",
    borderRadius: "15px",
  },
  rewardImg: {
    height: "200px",
    overflow: "hidden",
    borderRadius: "15px 15px 0 0",
  },
  bottom: {
    position: "absolute",
    bottom: "24px",
    center: "24px",
    width: "262px",
    display: "flex",
    justifyContent: "space-between",
  },
};

export default function Dashboard({ tab }) {
  const { Moralis, account, isInitialized, isAuthenticated } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();
  const days = [10, 10, 10, 20, 20, 20, 50];
  const { getDays, getLeaderBoard } = useCollectors();

  const [daysStreak, setDaysStreak] = useState(-1);
  const [collected, setCollected] = useState(true);
  const [userRunes, setUserRunes] = useState(0);
  const [dataSource, setDataSource] = useState();

  function getUsers(i) {
    if (i === daysStreak && !collected) {
      return "runeBtn2";
    } else {
      return "runeBtn";
    }
  }

  async function mintNFT() {
    if (userRunes < 2000) {
      let secondsToGo = 5;
      const modal = Modal.error({
        title: "Hold Up!",
        content: `Make sure you collect enough runes before collecting this reward`,
      });
      setTimeout(() => {
        modal.destroy();
      }, secondsToGo * 1000);
      return;
    }

    let options = {
      contractAddress: "0x5e81Bb513E435D3aC15DD46c2C903B9817dd547E",
      functionName: "createToken",
      abi: [
        {
          inputs: [],
          name: "createToken",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    };

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        let secondsToGo = 10;
        const modal = Modal.success({
          title: "Success!",
          content: `Check your wallet for your new magical NFT`,
        });
        setTimeout(() => {
          modal.destroy();
        }, secondsToGo * 1000);
      },
    });
  }

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const fetchStreak = async () => {
        const data = await getDays();
        const { daysInARow, lastCollected, runes } = data.attributes;
        setDaysStreak(daysInARow);
        setCollected(moment(lastCollected).isSame(moment.utc(), "day"));
        setUserRunes(runes);
        const dataLeader = await getLeaderBoard();
        setDataSource(dataLeader);
      };
      fetchStreak();
    } else {
      setDaysStreak(-1);
      setCollected(true);
      setUserRunes(0);
    }
  }, [isInitialized, isAuthenticated]);

  async function addRunes() {
    const users = Moralis.Object.extend("RuneCollectors");
    const query = new Moralis.Query(users);
    query.equalTo("ethAddress", account);
    const data = await query.first();
    const { lastCollected, daysInARow, runes } = data.attributes;

    if (!lastCollected || !moment(lastCollected).isSame(moment.utc(), "day")) {
      data.increment("runes", days[daysInARow]);
      data.set("lastCollected", moment.utc().format());
      setCollected(true);
      setUserRunes(runes + days[daysInARow]);
      if (daysInARow === 6) {
        data.set("daysInARow", 0);
        setDaysStreak(0);
      } else {
        setDaysStreak(daysInARow + 1);
        data.increment("daysInARow");
      }
      data.save();
      succCollect(days[daysInARow]);
    } else {
      failCollect();
    }
  }

  function succCollect() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: (
        <>
          <p>You have collected some DUKL$</p>
          <img src={Runes} alt="" style={{ width: "280px" }} />
        </>
      ),
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failCollect() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Hold Up!",
      content: `You can only collect runes once a day, please come back tomorrow`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "Patron",
      key: "ethAddress",
      render: (text, record) => (
        <Space size="middle">
          <Blockie
            style={{ border: "solid 2px #F500D0" }}
            address={record.ethAddress}
            scale={4}
          />
          <span>{getEllipsisTxt(record.ethAddress, 6)}</span>
        </Space>
      ),
    },
    {
      title: "DUKL$ Accumulated",
      dataIndex: "runes",
      key: "runes",
      align: "right",
    },
  ];

  if (tab === "runes") {
    return (
      <div style={{ width: "100%" }}>
        <Title level={2} style={{ color: "white" }}>
          Project: DUKL$
        </Title>
        <h2 style={{ width: "100%", color: "LightGreen" }}>
          Collect DUKL$ and climb the community leader board to be on the drop list!
        </h2>
        <div style={styles.collected}>
          <div style={styles.colHeading}>
            <span>My DUKL$</span>
            <p style={styles.count}>{userRunes}</p>
          </div>
          <div>
            <img src={Runes} alt="" />
          </div>
        </div>

        <Tag color="rgba(47,79,79, 0.2)" style={{ color: "#F500D0" }}>
          Collect DUKL$
        </Tag>

        <div style={styles.daily}>
          <div>
            <Title level={3} style={{ color: "white" }}>
              Daily DUKL$
            </Title>
            <p style={{ color: "gray" }}>
              If you visit your Int3rPlanetary Dashboard everyday you will have the opportunity to receive
              bonus DUKL$!
            </p>
          </div>
          <Button
            style={collected ? styles.cantCollect : styles.collect}
            onClick={() => addRunes()}
          >
            Collect DUKL$
          </Button>
        </div>
        <div style={styles.claimrow}>
          {days.map((e, i) => (
            <>
              <div className={getUsers(i)}>
                <p style={{ fontSize: "12px" }}>{`Day ${i + 1}`}</p>
                {i > daysStreak - 1 ? (
                  <img
                    src={Runes}
                    alt=""
                    style={{ width: "40%", margin: "6px auto" }}
                  />
                ) : (
                  <img
                    src={RunesCollected}
                    alt=""
                    style={{ width: "60%", margin: " auto" }}
                  />
                )}
                <p style={{ color: "white", fontSize: "18px" }}>{`+${e}`}</p>
              </div>
            </>
          ))}
        </div>
        <span style={{ color: "gray" }}>
          Learn more about the Order of the Artisans Foundation!{" "}
          <a href="https://orderoftheartisans.org/">OOTA Website</a>
        </span>
      </div>
    );
  }

  if (tab === "rewards") {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={2} style={{ color: "white" }}>
            Claim Your Rewards
          </Title>
          <Space size={"small"}>
            <span style={{ color: "light-grey" }}> Your DUKL$:</span>
            <Tag color={"#324252"} style={{ height: "22px" }}>
              <FireFilled /> {userRunes}
            </Tag>
          </Space>
        </div>

        <h2 style={{ width: "75%", color: "LightGreen", marginBottom: "35px" }}>
          Dillignetly collecting DUKL$ will allow you to claim amazing rewards
          like NFTs and goodies!
        </h2>

        <Tag color="rgba(47,79,79, 0.2)" style={{ color: "#F500D0" }}>
          Claim Rewards
        </Tag>
        <div style={styles.rew}>
          <Card
            onClick={() => mintNFT()}
            hoverable
            style={styles.rewardCard}
            cover={
              <div style={styles.rewardImg}>
                <img src={Mages} alt=""></img>
              </div>
            }
          >
            <Title level={5} style={{ color: "white" }}>
              DUKL$NFT Patron Farming
            </Title>
            <p style={{ color: "gray" }}>
              Collect DUKL$ and earn the title of Patron Farmer! Patron Farmers buy duck eggs at cost (+ shipping if not local), and help (virtually) raise a flock of Muscovy Ducks!
              </p>
            <div style={styles.bottom}>
              <Space size={"small"}>
                <span style={{ color: "gray" }}> Price:</span>
                <Tag color={"#324252"} style={{ height: "22px" }}>
                  <FireFilled /> 1000
                </Tag>
              </Space>
              <span style={{ color: "gray" }}> Supply: 100/100</span>
            </div>
          </Card>
          <Card
            hoverable
            style={styles.rewardCard}
            cover={
              <div style={styles.rewardImg}>
                <img src={Hoodie} alt=""></img>
              </div>
            }
          >
            <Title level={5} style={{ color: "white" }}>
              Artisan sWAG - Hoodie
            </Title>
            <p style={{ color: "gray" }}>
              Upgrade your wardrobe, by coverting your DUKL$ into some
              DUKL and Artisan sWAG!
            </p>
            <div style={styles.bottom}>
              <Space size={"small"}>
                <span style={{ color: "gray" }}> Price:</span>
                <Tag color={"#324252"} style={{ height: "22px" }}>
                  <FireFilled /> 1000
                </Tag>
              </Space>
              <span style={{ color: "gray" }}> Supply: 0</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (tab === "leaderboard") {
    return (
      <div style={{ width: "100%" }}>
        <Title level={2} style={{ color: "white" }}>
          DUKL$ Leaderboard
        </Title>
        <h2 style={{ width: "75%", color: "LightGreen" }}>
          Ranking of Patrons with the highest number of DUKL$ accumulated
        </h2>
        {dataSource && (
          <Table
            style={{ scrolling: "yes", width: "1000px", marginTop: "35px", scrollMarginBottom: "35px" }}
            dataSource={dataSource}
            columns={columns}
          />
        )}
        <p style={{ width: "50%", color: "lightGrey" }}>
          *The community of the Order of the Artisans is composed of Artisans and their Patrons. The Order defines an Artisan as an individual who utilizes imagination and diligence to create a product of value, e.g. STEAM (Science, Technology, Engineering, Art, and Mathematics).
        </p>
      </div>
    );
  }

  if (tab === "home") {
    return (
      <div style={{ width: "100%" }}>
        <iframe title="ipnn" src="https://interplanetarydb.io/" frameborder="0" scrolling="yes" width="100%" height="2000" align="center" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen> </iframe>
        <p style={{ width: "50%", color: "lightGrey" }}>
          *The community of the Order of the Artisans is composed of Artisans and their Patrons. The Order defines an Artisan as an individual who utilizes imagination and diligence to create a product of value, e.g. STEAM (Science, Technology, Engineering, Art, and Mathematics).
        </p>
      </div>
    );
  }

  if (tab === "social") {
    return (
      <div style={{ width: "100%" }}>
        <iframe title="ipnn" src="https://interplanetarydb.io/activity" frameborder="0" scrolling="yes" width="100%" height="2000" align="center" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen> </iframe>
        <p style={{ width: "50%", color: "lightGrey" }}>
          *The community of the Order of the Artisans is composed of Artisans and their Patrons. The Order defines an Artisan as an individual who utilizes imagination and diligence to create a product of value, e.g. STEAM (Science, Technology, Engineering, Art, and Mathematics).
        </p>
      </div>
    );
  }

  if (tab === "shop") {
    return (
      <div style={{ width: "100%" }}>
        <iframe title="ipnn" src="https://int3rplanetary.nftify.network/" frameborder="0" scrolling="yes" width="100%" height="2000" align="center" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen> </iframe>
        <p style={{ width: "50%", color: "lightGrey" }}>
          *The community of the Order of the Artisans is composed of Artisans and their Patrons. The Order defines an Artisan as an individual who utilizes imagination and diligence to create a product of value, e.g. STEAM (Science, Technology, Engineering, Art, and Mathematics).
        </p>
      </div>
    );
  }

  if (tab === "ipvs") {
    return (
      <div style={{ width: "100%" }}>
        <iframe title="ipnn" src="https://9lajklrnh8ur.usemoralis.com/" frameborder="0" scrolling="yes" width="100%" height="2000" align="center" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen> </iframe>
        <p style={{ width: "50%", color: "lightGrey" }}>
          *The community of the Order of the Artisans is composed of Artisans and their Patrons. The Order defines an Artisan as an individual who utilizes imagination and diligence to create a product of value, e.g. STEAM (Science, Technology, Engineering, Art, and Mathematics).
        </p>
      </div>
    );
  }  

  if (tab === "donate") {
    return (
      <div style={{ width: "100%" }}>
        <Title level={2} style={{ color: "white" }}>
          Donate to the Order of the Artisans Foundation ✨
        </Title>
        <h2 style={{ width: "75%", color: "LightGreen" }}>
        The mission of the Order is to inspire human progress, equality and unity, to develop an international network of artisans, to disrupt unethical business, to develop an artisan-centric social-economic safety net and to implement community support initiatives where the need arises.
        </h2>
        <br>
        </br>
        <p style={{ width: "100%", color: "LightGray" }}>Note: A 501(c)(3) organization is any organization that is exempt from federal tax under the United States Code, section 501c3. This includes nonprofit organizations that are working towards charity causes.</p>
        <br>
        </br>
        <h2>How to give to our cause:</h2>
        <br>
        </br>
        <a href="https://www.paypal.com/paypalme/OrderoftheArtisans" target="_blank" rel="noreferrer noopener" >💸 PayPal</a>
        <br>
        </br>
        <a href="https://checkout.opennode.co/p/82b5d207-569f-4b9a-a8d1-b6e13ebbbfc8" target="_blank" rel="noreferrer noopener">💊 BTC</a>
        <p style={{ width: "75%", color: "LightGreen" }}>🚀 ERC: 0x513cC181dF2f60635B66ED413823CAee4eCcD05A</p>
        <p style={{ width: "100%", color: "#fff" }}>💪 Matic on Polygon via our ArtisanNFT DApp below</p>
        <br>
        </br>
        <iframe title="ipnn" src="https://artisannft-brickelltechnolog.vercel.app" background= "#000" frameborder="0px" scrolling="yes" width="25%" height="750" align="center" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen> </iframe>
        <br>
        </br>
        <br>
        </br>
        <span style={{ color: "gray" }}>
          Learn more about the{" "}
          <a href="https://orderoftheartisans.org/">Order of the Artisans Foundation!</a>
        </span>
        <p style={{ width: "50%", color: "lightGrey" }}>
          *The community of the Order of the Artisans is composed of Artisans and their Patrons. The Order defines an Artisan as an individual who utilizes imagination and diligence to create a product of value, e.g. STEAM (Science, Technology, Engineering, Art, and Mathematics).
        </p>
      </div>
    );
  }

}