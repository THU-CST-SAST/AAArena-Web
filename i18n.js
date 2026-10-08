/* Local dictionaries only: no translation service, network request or data mutation. */
(() => {
 'use strict';
 let language='en';
 try { if(localStorage.getItem('aaarena-language')==='zh')language='zh'; } catch {}
 const words = new Map(Object.entries({
  'Home':'首页','Leaderboard':'榜单','Games':'游戏','Contact':'联系我们','Paper':'论文',
  'Abstract':'摘要','Main results':'主要结果','Ablations':'消融实验','Overview':'游戏说明','Records':'实验记录',
  'Skip to content':'跳至正文','Main navigation':'主导航','AAArena home':'AAArena 首页','Tsinghua University':'清华大学',
  'Can AI Agents Build Game Agents for Real-World Adversarial Games?':'AI 能为真实对抗游戏编写策略吗？',
  'Adversarial Heuristic Learning':'对抗式启发学习','Fixed model.':'模型不变。','Evolving code.':'策略不断改进。',
  'Coding agent':'编程 AI','Base model stays fixed':'不修改模型权重','edits':'编写','Game agent':'策略程序',
  'Code, tools & notes evolve':'不断完善代码、工具和笔记','plays':'对战','Human opponents':'人类选手','Frozen program pool':'历届选手程序，固定不变',
  'Feedback → next revision':'根据反馈，继续改进','match units':'小规模对局预算','full-pool calls':'整池评测次数',
  'Test chosen opponents':'挑选对手，检验策略','Detailed replays':'详细回放','Evaluate the whole pool':'与选手池全体对战','Elo & pool rank':'Elo 与选手池排名',
  'Keep the strongest evaluated program.':'留下历次评测中表现最好的策略。','How far do the agents get?':'AI 写的策略能排第几？',
  'Best human-pool rank across the seven models · Table 2':'七个模型在各游戏中取得的最高排名 · 表 2','Read the full abstract':'查看完整摘要',
  'Results across 12 games':'12 个游戏的实验结果','Human-pool rank · Elo below':'选手池排名，下方为 Elo',
  'Highest Elo in game':'该游戏最高 Elo','Game':'游戏','Model':'模型','All games':'全部游戏','Gold medals':'金牌数',
  'Human-pool rank':'人类选手池排名','Pool rank':'选手池排名','Rank':'排名','Game details':'游戏详情','Export CSV':'导出 CSV','Export results':'导出结果',
  'Scoring & data source':'评分方法与数据来源','Scoring protocol':'评分方法','Search games':'搜索游戏','Sort by':'排序方式',
  'Rule complexity ↑':'规则复杂度 ↑','Pool size ↓':'选手池规模 ↓','Name A–Z':'名称 A–Z','Game category':'游戏分类',
  'Tactics':'战术','Economy':'经济','Territory':'领地','Defence':'塔防','Maze':'迷宫','Survival':'生存',
  'No matching games':'没有匹配的游戏','Try another name or clear the search.':'换个名称试试，或清空搜索。','Clear search':'清空搜索',
  'Pool sizes count programs, not unique players. AST measures rule-description size, not optimal-play difficulty.':'选手池大小按程序数量计算，同一选手的不同程序分别计数。AST 节点数反映规则本身有多复杂，不代表找到最优策略有多难。',
  'Competitive maze collection':'迷宫吃豆，争夺分数','Snake movement and territory':'操控贪吃蛇，圈地争胜','Asymmetric maze pursuit':'迷宫追逐：吃豆人与幽灵',
  'Mining and resource control':'占领金矿，积累财富','Tower defence and economy':'建造防线，经营蚁群','Multiplayer survival and escape':'空间站求生与逃脱',
  'Hidden-identity tactical combat':'猜测鱼种，搭配阵容','Territorial and army control':'调兵遣将，攻城略地','Resource competition and army development':'争夺资源，培养英雄',
  'Hex-grid unit tactics':'六边形战场上的战术对决','Hero control and lane combat':'操控英雄，突破防线','Ordered tower-defence operations':'塔防对抗，操作顺序决定成败',
  'Game data':'游戏数据','Human programs':'人类选手程序','Rule AST nodes':'规则 AST 节点','Rule atoms':'规则原子数','Evaluated models':'参评模型',
  'Small-match budget':'小规模对局预算','Full-pool budget':'整池评测预算','Paper summary':'论文中的简述','How it plays':'游戏规则',
  'Sources & scope':'来源与适用范围','Rule chapters':'规则章节','Paper summary in Appendix A':'论文附录 A 中的游戏简述',
  'Gameplay summary compiled from the competition material and bundled Arena backend. This is not a verbatim historical manual; match configuration can change defaults.':'以下规则根据比赛资料和 Arena 中的游戏后端整理，不是原版比赛手册。文中的默认数值可能随对局配置变化。',
  'Model leaderboard':'模型榜单','Main-stage records':'主实验记录','Best retained submission from each model · Table 2':'各模型保留的最佳策略 · 表 2',
  'Stage':'阶段','Main':'主实验','Main · 128 / 16':'主实验 · 128 / 16','Extended':'追加预算','Small / full budget':'小规模 / 整池预算',
  'The snapshot contains champion results, not individual match logs or playable replays.':'这里只展示各模型最佳策略的评测结果，不提供逐局日志或回放。',
  'Continuation · GLM-5.3':'追加迭代 · GLM-5.3','Same run, additional budget · Table 4':'同一轮实验追加预算 · 表 4',
  'Champion history · GLM-5.3':'最佳策略的改进过程 · GLM-5.3','Selected improvements, not every submission · Table 3':'选取部分改进节点，并非全部提交 · 表 3',
  'Evaluation':'评测','Policy change':'策略变化','Condition':'实验条件','Replay feedback':'回放反馈','Opponent selection':'对手选择',
  'Batch size':'每轮对手数','Opponents':'对手','Replay learning · GLM-5.3':'回放学习 · GLM-5.3','Replay source':'回放来源','On-policy':'自己的对局回放','Off-policy':'其他策略的对局回放',
  'Main-run token use':'主实验 token 用量','Millions · Table 9':'单位：百万 · 表 9','Input + output tokens (M)':'输入 + 输出 token（百万）',
  'Ablation studies':'消融实验','GLM-5.3 · 128 / 16 budget':'GLM-5.3 · 128 / 16 预算','Retained champions · 128 / 16 budget · Table 2':'保留的最佳策略 · 128 / 16 预算 · 表 2',
  'Dense replays improve Elo in all three reported games.':'这三个游戏中，提供详细回放都比只告知胜负取得了更高的 Elo。',
  'Model-selected and ladder opponents outperform top-four-only selection in these runs.':'让模型自己挑选对手，或按天梯选择对手，都比只挑战前四名效果更好。',
  'The best batch sizes are 4 for Pacman and Miracle, and 2 for AntWar.':'Pacman 和 Miracle 每轮选 4 个对手时效果最好；AntWar 则是 2 个。',
  'Exact values':'查看数值','Reference':'参照组','Best condition':'最佳设置','Highest Elo':'最高 Elo','Dense replays':'详细回放','Binary feedback':'只告知胜负',
  'Ladder':'天梯选择','Random':'随机选择','Top-4':'前四名','1 opponent':'1 个对手','2 opponents':'2 个对手','4 opponents':'4 个对手','8 opponents':'8 个对手',
  'Median of 3 runs. Opus5.5 uses Claude Code; other models use Codex. Elo is comparable within a game, not across games.':'结果取 3 次实验的中位数。Opus5.5 使用 Claude Code，其余模型使用 Codex。Elo 只能在同一游戏内比较。',
  'Table 2 · Median of 3 runs · 128 / 16 budget. Opus5.5: Claude Code; other models: Codex.':'表 2 · 3 次实验的中位数 · 128 / 16 预算。Opus5.5 使用 Claude Code，其余模型使用 Codex。',
  'Ranks are measured against the human pool. Each model is evaluated independently.':'每个模型分别与人类选手池对战，再计算它在池中的排名。',
  'Student Association for Science and Technology':'清华大学计算机系学生科协','Department of Computer Science and Technology, Tsinghua University':'清华大学计算机科学与技术系','Department of Computer Science and Technology':'计算机科学与技术系',
  'The association’s Agent Department organizes the Tsinghua Agent Competition, the source of the games and archived human programs.':'本项目使用的游戏和选手程序，来自科协智能体部举办的历届清华大学智能体大赛。',
  'Visit SAST':'访问科协网站','Project leads':'项目负责人','Game not found':'未找到该游戏','Browse all games':'浏览全部游戏',
  'Iteration':'迭代流程','Pause':'暂停','Play':'播放','Pause animation':'暂停动画','Play animation':'播放动画','Policy iteration':'策略迭代',
  'Policy':'策略','Matches':'对局','Replays':'回放','Workflow illustration':'流程示意','Write  →  Evaluate  →  Revise':'编写 → 评测 → 修改',
  'Full-pool evaluation':'整池评测','Selected champion milestones · Paper Table 3':'最佳策略的部分改进节点 · 论文表 3',
  'Animation':'动画','Research sections':'论文内容','Game details':'游戏详情','Result metric':'显示指标','Ablation experiment':'消融实验',
  'Policy iteration illustration':'策略迭代示意图','Schematic policy, match and replay iteration. Not actual gameplay.':'策略、对局与回放的迭代流程示意，并非真实游戏画面。',
  'Dorado GLM-5.3, measured champion progress from pool rank 41 to 2.':'GLM-5.3 在 Dorado 中不断改进策略，将选手池排名从第 41 名提升到第 2 名。',
  'A coding agent revises an executable policy, which plays frozen human opponents. Match replays and full-pool rankings feed back into the next revision.':'AI 编写策略程序，与固定选手池中的人类选手程序对战，再参考对局回放和整池评测排名继续修改。',
  'Per-game model results':'各游戏的模型结果','Results table':'结果表','Main experimental results, paper Table 2':'主要实验结果，论文表 2',
  'Paper Table 2: human-pool rank and Elo for each game and model. Summary counts gold medals, not an overall model ranking.':'论文表 2：各模型在各游戏中的选手池排名与 Elo。最后一行只统计金牌数，不代表模型的综合排名。',
  'Main-stage records':'主实验记录','Continuation results':'追加迭代结果','Dorado champion milestones':'Dorado 最佳策略改进节点','Ablation records':'消融实验记录',
  'Figure 13 replay-learning results':'图 13 回放学习结果','Per-game token consumption':'各游戏 token 用量',
  'The first full-pool evaluation establishes the starting point.':'首次整池评测，记录初始策略的表现。','Keep mining; attack only a vulnerable enemy base.':'以采矿为主，只在敌方基地防守薄弱时进攻。',
  'Use all living heroes to defend a serious threat.':'遇到严重威胁时，调动所有存活英雄回防。','Trigger full defence for active threats or recent base hits.':'发现威胁，或基地近期遭到攻击时，立即全力回防。',
  'Exclude dead miners from occupancy and spread assignments.':'分配采矿任务时，不再把已死亡的英雄算作矿点占用者，并让英雄分散采矿。','Increase the penalty for sending multiple miners to one mine.':'调整任务评分，进一步避免把多名英雄派往同一矿点。',
  'Track opening windows and prioritize mines that are actually open.':'记录矿点开放时间，优先前往当前可以开采的矿点。','Concentrate upgrades on two heroes while preserving mining income.':'保证采矿收入，集中资源升级两名核心英雄。',
  'Allow a one-hero counterattack only after sustained nearby aggression.':'只有在附近持续遭到进攻时，才派一名英雄反击。'
 }));
 words.set(window.ARENA.paper.abstract,'从启发式搜索到强化学习，AI 在对抗游戏中取得了长足进步，但如何快速适应不同对手，仍然是个难题。我们在启发式学习（HL）的基础上提出对抗式启发学习（AHL）：不修改模型权重，而是让 AI 根据对局反馈，不断改进策略代码和配套工具。为检验这种方法，我们构建了 AAArena，收录 12 个真实比赛游戏及历届人类选手的程序，分别限制小规模对局和整池评测的次数，考察 AI 开发游戏策略的能力。在 7 个模型中，使用 Claude Code 的 Opus5.5 在 6 个游戏中取得了金牌；另外 6 个游戏则尚无模型登顶。分析策略改进过程可以看到，理解复杂规则、把想法写成有效代码，以及规划后续改进，仍是 AI 面临的难点。进一步实验表明，AI 不仅能从自己的对局中学习，也能借助其他策略的回放改进；相比只告知胜负，提供详细回放的效果更好。');
 const score1='Results are retained champions from Table 2 of the paper, using 128 small-match units and 16 full-pool evaluations. Each model’s program is evaluated independently against a frozen human ladder; rank is its insertion position in that ladder. Elo is fitted with fixed opponent ratings and one virtual draw at the pool mean. The score retains the highest officially evaluated Elo, including the common initialization baseline. The main table reports the median of three runs per setting. All models use max reasoning effort; Opus5.5 uses Claude Code and the other six use Codex, so comparisons involve both model and harness.';
 words.set(score1,'榜单采用论文表 2 的结果。每次实验允许使用 128 单位的小规模对局预算和 16 次整池评测，保留正式评测中 Elo 最高的策略；各模型共用的初始策略也参与这一比较。每个候选程序单独与固定的人类选手池对战，再按 Elo 确定它能排在什么位置。计算时保持人类选手的 Elo 不变，并加入一场虚拟平局，对手的 Elo 取选手池平均值。表中数值为每组 3 次实验的中位数。所有模型均使用最高推理强度；Opus5.5 通过 Claude Code 运行，其余六个模型通过 Codex 运行，因此结果既受模型影响，也受运行框架影响。');
 words.set('Gold medal counts follow the summary row in Table 2. Elo is comparable within a game; no cross-game score or overall model ranking is computed. Continuation and off-policy runs are excluded from this main leaderboard. A gold medal means rank 1 under the fixed-pool rating protocol, not a proven head-to-head win over the human leader or optimal play.','金牌数与论文表 2 一致。不同游戏的 Elo 不能直接比较，因此这里不计算跨游戏总分，也不设模型综合排名。追加预算实验和借助其他策略回放的实验不计入主榜。金牌仅表示按这套评分方法排在选手池第一，并不证明该程序能在直接对战中战胜人类榜首，更不代表它已经找到最优策略。');
 const patterns=[
  [/^(\d[\d,]*) human programs · Sorted by Elo$/,m=>`${m[1]} 份人类选手程序 · 按 Elo 排序`],
  [/^(\d[\d,]*) human programs$/,m=>`${m[1]} 份人类选手程序`],
  [/^(\d[\d,]*) programs$/,m=>`${m[1]} 份程序`],
  [/^programs$/,()=> '份程序'],
  [/^(\d+) \/ 12 games$/,m=>`${m[1]} / 12 个游戏`],
  [/^Exported (\d+) results$/,m=>`已导出 ${m[1]} 条结果`],
  [/^Evaluation (\d+)$/,m=>`第 ${m[1]} 次评测`],
  [/^Elo ([\d.-]+) · pool rank (\d+)$/,m=>`Elo ${m[1]} · 选手池第 ${m[2]} 名`],
  [/^Reference: (.+)$/,m=>`参照组：${translate(m[1])}`],
  [/^Table (\d+)$/,m=>`表 ${m[1]}`],
  [/^Separate GLM-5.3 ablation runs · Table (\d+)$/,m=>`独立的 GLM-5.3 消融实验 · 表 ${m[1]}`],
  [/^(\d+) of 12 ladders topped\. Opus5\.5 earns 6 gold medals; the other 6 ladders remain untopped\.$/,m=>`12 个游戏中，AI 已在 ${m[1]} 个游戏中登顶，金牌均由 Opus5.5 获得。另外 6 个游戏尚无参评模型登顶。`],
  [/^Ranks are insertion positions among (\d+) human programs\. Each model is evaluated independently\.$/,m=>`选手池包含 ${m[1]} 份人类选手程序。每个模型单独评测，排名表示其策略在这个池中所处的位置。`],
  [/^Δ = Elo change from the reference within each game\. Elo is not comparable across games\. Separate ablation settings; not main-table cells\. Table (\d+)\.$/,m=>`Δ 表示与参照组相比，Elo 增加或减少了多少。只比较同一游戏内的结果。这组数据来自单独开展的消融实验，不是主实验榜单。见表 ${m[1]}。`],
  [/^(.+) details$/,m=>`${m[1]} 详情`],
  [/^(.+): best pool rank (\d+)\. View results$/,m=>`${m[1]}：最好成绩为选手池第 ${m[2]} 名。查看结果`],
  [/^Reported model champions in (.+), ordered by Elo; ranks are positions in the human pool$/,m=>`${m[1]} 各模型的最佳策略，按 Elo 排列；名次为人类选手池中的排名`]
 ];
 function translate(value){
  if(language==='en')return value;
  const s=String(value),key=s.trim();
  let result=words.get(key);
  if(result===undefined){
   const suffix=key.match(/^(.*?)( [↗→↓])$/);
   if(suffix)result=translate(suffix[1])+suffix[2];
   else for(const [pattern,fn] of patterns){const match=key.match(pattern);if(match){result=fn(match);break;}}
  }
  return result===undefined?s:s.replace(key,result);
 }
 const originals=new WeakMap();
 function apply(root=document.body){
  const visit=node=>{
   if(node.nodeType===Node.TEXT_NODE){
    const previous=originals.get(node);
    const original=previous&&node.data===previous.rendered?previous.original:node.data;
    const rendered=translate(original);
    if(node.data!==rendered)node.data=rendered;
    originals.set(node,{original,rendered});
   }else if(node.nodeType===Node.ELEMENT_NODE){
    if(node.matches('script,style,[data-no-i18n]'))return;
    for(const key of ['aria-label','placeholder','title','alt']){
     const attr=node.getAttributeNode(key);if(attr)visitAttribute(attr);
    }
    for(const child of node.childNodes)visit(child);
   }
  };
  const visitAttribute=attr=>{
   const previous=originals.get(attr),original=previous&&attr.value===previous.rendered?previous.original:attr.value;
   const rendered=translate(original);if(attr.value!==rendered)attr.value=rendered;
   originals.set(attr,{original,rendered});
  };
  visit(root);
 }
 function set(next){
  language=next==='zh'?'zh':'en';
  try{localStorage.setItem('aaarena-language',language);}catch{}
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
 }
 document.documentElement.lang=language==='zh'?'zh-CN':'en';
 window.ArenaI18n={get language(){return language;},t:translate,apply,set};
})();
