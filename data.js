/* Transcribed from AAArena(1).pdf, Tables 1–4, 6–8. Static paper snapshot. */
window.ARENA = {
 models: ["GLM-5.3","Kimi K3","Qwen 3.8","DeepSeek V4 Pro","LongCat 2.0"],
 games: [
 ["Pacman","Competitive maze collection",44,1127,219,"Maze",[[2281.6,1],[2196.3,2],[2236.1,1],[2096.8,4],[1835.0,10]]],
 ["SnakeGo","Snake movement and territory",141,1538,308,"Territory",[[1141.2,4],[1165.9,3],[1107.5,5],[1097.0,5],[1153.3,4]]],
 ["Rollman","Asymmetric maze pursuit",64,1539,312,"Maze",[[581.2,1],[636.9,1],[636.9,1],[807.7,1],[534.2,1]]],
 ["MoneCraft","Mining and resource control",112,1823,347,"Economy",[[2359.2,1],[2288.2,3],[2288.2,3],[2288.2,3],[2069.9,9]]],
 ["AntWar","Tower defence and economy",114,2160,368,"Defence",[[1464.2,5],[1130.2,9],[1355.0,5],[1167.2,9],[1028.3,11]]],
 ["LostSpace","Multiplayer survival and escape",111,2297,426,"Survival",[[1980.1,2],[1916.1,2],[1797.7,3],[1956.8,2],[1052.9,77]]],
 ["AquaWar","Hidden-identity tactical combat",170,2531,439,"Tactics",[[1494.1,1],[1494.1,1],[1539.7,1],[1464.5,1],[919.3,71]]],
 ["Generals","Territorial and army control",197,2683,461,"Territory",[[1441.2,17],[1433.3,17],[1624.9,10],[1340.8,23],[1010.3,58]]],
 ["Dorado","Resource competition and army development",323,4241,616,"Economy",[[2210.3,2],[2023.4,16],[2035.8,14],[2187.8,3],[1512.4,156]]],
 ["Miracle","Hex-grid unit tactics",253,4391,581,"Tactics",[[1436.8,26],[1432.8,26],[1500.2,18],[1448.8,24],[1425.0,27]]],
 ["LOTA","Hero control and lane combat",200,4513,684,"Tactics",[[2147.4,22],[2133.2,22],[2099.0,25],[2140.3,22],[1823.3,47]]],
 ["AntWar2","Ordered tower-defence operations",191,6368,1008,"Defence",[[1977.1,9],[1644.2,19],[2183.5,6],[1511.3,29],[1395.9,37]]]
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
