/* Transcribed from Can_AI_Agent_Build_Game_Agent.pdf, Tables 1–4, 6–9 and Figure 13. Static paper snapshot. */
window.ARENA = {
 paper: {
  arxivUrl: null, // Set the published https://arxiv.org/abs/... URL to enable all paper links.
  sha256: "68abbc69fdb0582ea2fb86f69a1f1c569a621747e3fbcc5fa21989f7bf48b879",
  title: "Can AI Agents Build Game Agents for Real-World Adversarial Games?",
  abstract: "AI for adversarial games has progressed from heuristic search to reinforcement learning, yet adapting efficiently to diverse opponents remains challenging. Building on heuristic learning (HL), we formalize Adversarial Heuristic Learning (AHL), a framework in which an AI agent improves executable policies and supporting software through game feedback while its base model’s weights remain fixed. We introduce AAArena, comprising 12 real-world competition games and archived human programs, to evaluate policy development under separate match and full-pool evaluation budgets. Our evaluation of 7 AI models shows that, while Opus5.5 with Claude Code earns 6 gold medals, no evaluated model reaches first place in the other 6 frozen human ladders. Case studies and trajectory analyses reveal persistent difficulties in understanding complex rules, implementing effective strategies, and planning long-term policy improvement. Further experiments show that agents can improve their policies using both on-policy and off-policy replays, with dense feedback yielding better performance than binary feedback.",
  authors: ["Kaisen Yang","Qingle Liu","Kejin Wang","Yicheng Zhao","Jieming Li","Shenghan Zheng","Ruize Yang","Bojun Yang","Heng Gong","Xiang Gao","Lanyue Zhang","Kaiyu Zhong","Zhuo Liu","Shaoxuan Li","Chengxi Li","Yong Yan","Weixuan Zhang","Tianwei Luo","Situ Wang","Youjie Zheng","Sihan Zhao","Shengyuan Wang","Huan-ang Gao","Jiazheng Xu","Xiaohui Xie","Wentao Han","Hongning Wang"]
 },
 models: ["Opus5.5","GPT6-sol","GLM-5.3","Kimi K3","DeepSeek V4 Pro","Qwen 3.8","LongCat 2.0"],
 harnesses: ["Claude Code","Codex","Codex","Codex","Codex","Codex","Codex"],
 mainOrder: ["Rollman","Pacman","AntWar","AquaWar","Generals","LostSpace","Miracle","Dorado","MoneCraft","LOTA","SnakeGo","AntWar2"],
 tokens: {"Rollman":[48.75,25.28,23.82,5.5,6.11,14.68,18.35],"Pacman":[22.16,16.14,33.14,40.17,91.95,163.12,17.52],"AntWar":[74.19,16.08,142.94,54.59,102.8,284.29,37.56],"AquaWar":[76.95,26.37,68.68,1.49,60.11,13.92,20.65],"Generals":[75.44,19.66,137.23,88.88,172.7,60.95,22.3],"LostSpace":[65.37,21.58,149.86,72.03,141.51,190.16,100.95],"Miracle":[89.29,19.15,61.99,34.78,47.89,107.55,49.05],"Dorado":[44.58,23.02,105.63,60.72,67.01,253.02,10.14],"MoneCraft":[56.16,22.1,6.75,29.97,67.54,48.72,31.18],"LOTA":[76.41,17.36,32.55,30.74,34.04,112.36,21.92],"SnakeGo":[48.53,23.53,22.49,59.75,29.79,78.77,27.35],"AntWar2":[58.78,30.07,115.7,71.08,44.08,126.53,67.2]},
 tokenTotals: [736.61,260.34,900.78,549.7,865.53,1454.07,424.17],
 replayLearning: [["Pacman",[2281.6,1],[2404.4,1],30,14],["AntWar",[1464.2,5],[930.7,19],69,16],["Miracle",[1436.8,26],[1528.2,15],128,16]],
 games: [
 ["Pacman","Competitive maze collection",44,1127,219,"Maze",[[2703.9,1],[2367.6,1],[2281.6,1],[2196.3,2],[2096.8,4],[2236.1,1],[1835,10]]],
 ["SnakeGo","Snake movement and territory",141,1538,308,"Territory",[[1860.9,1],[1129.6,4],[1141.2,4],[1165.9,3],[1097,5],[1107.5,5],[1153.3,4]]],
 ["Rollman","Asymmetric maze pursuit",64,1539,312,"Maze",[[1010.2,1],[581.2,1],[581.2,1],[636.9,1],[807.7,1],[636.9,1],[534.2,1]]],
 ["MoneCraft","Mining and resource control",112,1823,347,"Economy",[[2387.1,1],[2418.2,1],[2359.2,1],[2288.2,3],[2288.2,3],[2288.2,3],[2069.9,9]]],
 ["AntWar","Tower defence and economy",114,2160,368,"Defence",[[1405.1,5],[1311.7,6],[1464.2,5],[1130.2,9],[1167.2,9],[1355,5],[1028.3,11]]],
 ["LostSpace","Multiplayer survival and escape",111,2297,426,"Survival",[[2220.2,1],[1625.2,7],[1980.1,2],[1916.1,2],[1956.8,2],[1797.7,3],[1052.9,77]]],
 ["AquaWar","Hidden-identity tactical combat",170,2531,439,"Tactics",[[1552.5,1],[1552.5,1],[1494.1,1],[1494.1,1],[1464.5,1],[1539.7,1],[1116.1,33]]],
 ["Generals","Territorial and army control",197,2683,461,"Territory",[[1689.6,10],[1528.4,13],[1441.2,17],[1433.3,17],[1340.8,23],[1624.9,10],[1010.3,58]]],
 ["Dorado","Resource competition and army development",323,4241,616,"Economy",[[2252.4,2],[2271.5,2],[2210.3,2],[2023.4,16],[2187.8,3],[2035.8,14],[1512.4,156]]],
 ["Miracle","Hex-grid unit tactics",253,4391,581,"Tactics",[[1704.8,6],[1469.5,20],[1436.8,26],[1432.8,26],[1448.8,24],[1500.2,18],[1500.2,18]]],
 ["LOTA","Hero control and lane combat",200,4513,684,"Tactics",[[2224.2,15],[2140.3,22],[2147.4,22],[2133.2,22],[2140.3,22],[2099,25],[1585.1,74]]],
 ["AntWar2","Ordered tower-defence operations",191,6368,1008,"Defence",[[2234.4,5],[1440.3,34],[1977.1,9],[1644.2,19],[1569.6,25],[2183.5,6],[1460,31]]]
 ].map(([name,description,pool,ast,ra,category,results])=>({name,description,pool,ast,ra,category,results})),
 milestones: [
 [1,1760.2,41,"A weak starting policy","The first full-pool evaluation establishes the starting point."],
 [2,1782.0,36,"Defend the economy","Keep mining; attack only a vulnerable enemy base."],
 [4,1800.7,35,"Respond to serious threats","Use all living heroes to defend a serious threat."],
 [6,1802.8,35,"Remember recent damage","Trigger full defence for active threats or recent base hits."],
 [8,1862.8,29,"Count living miners","Exclude dead miners from occupancy and spread assignments."],
 [9,1977.9,18,"Reduce duplicate assignments","Increase the penalty for sending multiple miners to one mine."],
 [10,2040.1,14,"Track mine availability","Track opening windows and prioritize mines that are actually open."],
 [11,2187.8,3,"Invest in a two-hero core","Concentrate upgrades on two heroes while preserving mining income."],
 [16,2210.3,2,"Counterattack conditionally","Allow a one-hero counterattack only after sustained nearby aggression."]
 ],
 continuation: [
 ["Generals",1441.2,17,1441.2,17],
 ["Miracle",1436.8,26,1486.8,19],
 ["LOTA",2147.4,22,2147.4,22],
 ["AntWar2",1977.1,9,2117.0,6]
 ],
 ablations:{
  feedback:{title:"A replay explains more than a loss.",description:"Dense replay feedback improves retained-champion Elo in all three representative games. These are separate ablation runs, not the main-table cells.",labels:["Dense replays","Binary feedback"],rows:[["Pacman",[2236.1,1710.1]],["AntWar",[1118.7,880.6]],["Miracle",[1528.2,1461.1]]],source:"Table 7 · GLM-5.3 · 128 / 16"},
  opponents:{title:"The strongest opponent is not always the best teacher.",description:"Ladder selection leads on Pacman and AntWar; model selection leads on Miracle. Restricting small matches to the top four is weakest in these runs.",labels:["Model","Ladder","Random","Top-4"],rows:[["Pacman",[2096.8,2127.5,2014.4,1897.0]],["AntWar",[1180.5,1311.7,1154.4,1056.2]],["Miracle",[1482.4,1448.8,1457.0,1406.0]]],source:"Table 6 · GLM-5.3 · batch size 4"},
  batch:{title:"Breadth of evidence. Room to iterate.",description:"Intermediate batches work best here: four opponents on Pacman and Miracle, two on AntWar. Larger batches spend the same feedback budget in fewer revision cycles.",labels:["1 opponent","2 opponents","4 opponents","8 opponents"],rows:[["Pacman",[2040.6,2196.3,2703.9,2160.4]],["AntWar",[1130.2,1433.4,1208.7,1118.7]],["Miracle",[1338.7,1491.2,1518.7,1465.3]]],source:"Table 8 · GLM-5.3 · fixed 128 / 16 budget"}
 }
};
