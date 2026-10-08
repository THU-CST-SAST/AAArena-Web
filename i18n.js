/* Local dictionaries only: no translation service, network request or data mutation. */
(() => {
 'use strict';
 let language='en';
 try { if(localStorage.getItem('aaarena-language')==='zh')language='zh'; } catch {}
 const words = new Map(Object.entries({
  'Home':'首页','Leaderboard':'榜单','Games':'游戏','Contact':'联系我们','Paper':'论文',
  'Abstract':'摘要','Main results':'主要结果','Ablations':'消融实验','Overview':'游戏说明','Records':'实验记录',
  'Skip to content':'跳至正文','Main navigation':'主导航','AAArena home':'AAArena 首页','Tsinghua University':'清华大学',
  'Can AI Agents Build Game Agents for Real-World Adversarial Games?':'AI 智能体能为真实对抗游戏构建游戏智能体吗？',
  'Adversarial Heuristic Learning':'对抗式启发学习','Fixed model.':'模型固定。','Evolving code.':'代码进化。',
  'Coding agent':'编程智能体','Base model stays fixed':'基础模型权重不变','edits':'修改','Game agent':'游戏智能体',
  'Code, tools & notes evolve':'持续改进代码、工具与笔记','plays':'对战','Human opponents':'人类对手','Frozen program pool':'固定的选手程序池',
  'Feedback → next revision':'反馈 → 下一次迭代','match units':'小规模对局预算','full-pool calls':'整池评测次数',
  'Test chosen opponents':'挑战所选对手','Detailed replays':'详细回放','Evaluate the whole pool':'对战完整选手池','Elo & pool rank':'Elo 与池内排名',
  'Keep the strongest evaluated program.':'保留经过评测的最强程序。','How far do the agents get?':'智能体达到了什么水平？',
  'Best human-pool rank across the seven models · Table 2':'七个模型在人类选手池中的最佳排名 · 表 2','Read the full abstract':'阅读全文摘要',
  'Results across 12 games':'12 个游戏的实验结果','Human-pool rank · Elo below':'人类池内排名 · 下方为 Elo',
  'Highest Elo in game':'该游戏最高 Elo','Game':'游戏','Model':'模型','All games':'全部游戏','Gold medals':'金牌数',
  'Human-pool rank':'人类池内排名','Pool rank':'池内排名','Rank':'排名','Game details':'游戏详情','Export CSV':'导出 CSV','Export results':'导出结果',
  'Scoring & data source':'计分方法与数据来源','Scoring protocol':'计分协议','Search games':'搜索游戏','Sort by':'排序方式',
  'Rule complexity ↑':'规则复杂度 ↑','Pool size ↓':'选手池规模 ↓','Name A–Z':'名称 A–Z','Game category':'游戏分类',
  'Tactics':'战术','Economy':'经济','Territory':'领地','Defence':'塔防','Maze':'迷宫','Survival':'生存',
  'No matching games':'没有匹配的游戏','Try another name or clear the filters.':'请尝试其他名称，或清除筛选条件。','Clear filters':'清除筛选',
  'Pool sizes count programs, not unique players. AST measures rule-description size, not optimal-play difficulty.':'选手池规模按程序数统计，而非去重人数。AST 衡量规则描述的规模，不代表最优策略的求解难度。',
  'Competitive maze collection':'迷宫中的吃豆对抗','Snake movement and territory':'蛇的移动与领地争夺','Asymmetric maze pursuit':'非对称迷宫追逐',
  'Mining and resource control':'矿点占领与资源控制','Tower defence and economy':'塔防与经济管理','Multiplayer survival and escape':'多人求生与逃脱',
  'Hidden-identity tactical combat':'隐藏身份的战术对抗','Territorial and army control':'领土扩张与军队指挥','Resource competition and army development':'资源争夺与英雄养成',
  'Hex-grid unit tactics':'六边形棋盘上的单位战术','Hero control and lane combat':'英雄操控与战线争夺','Ordered tower-defence operations':'有序操作的塔防对抗',
  'Game data':'游戏数据','Human programs':'人类选手程序','Rule AST nodes':'规则 AST 节点','Rule atoms':'规则原子数','Evaluated models':'参评模型',
  'Small-match budget':'小规模对局预算','Full-pool budget':'整池评测预算','Paper summary':'论文中的简述','How it plays':'游戏规则',
  'Sources & scope':'来源与适用范围','Rule chapters':'规则章节','Paper summary in Appendix A':'论文附录 A 中的游戏简述',
  'Gameplay summary compiled from the competition material and bundled Arena backend. This is not a verbatim historical manual; match configuration can change defaults.':'根据比赛资料及 Arena 所附后端整理的玩法说明，并非历史手册逐字复刻；具体对局配置可能调整默认参数。',
  'Model leaderboard':'模型榜单','Main-stage records':'主实验记录','Best retained submission from each model · Table 2':'各模型保留的最佳策略 · 表 2',
  'Stage':'阶段','Main':'主实验','Main · 128 / 16':'主实验 · 128 / 16','Extended':'追加预算','Small / full budget':'小规模 / 整池预算',
  'The snapshot contains champion results, not individual match logs or playable replays.':'此处展示最佳策略的结果快照，不包含逐局日志或可播放回放。',
  'Continuation · GLM-5.3':'追加迭代 · GLM-5.3','Same run, additional budget · Table 4':'同一轮实验追加预算 · 表 4',
  'Champion history · GLM-5.3':'最佳策略的改进过程 · GLM-5.3','Selected improvements, not every submission · Table 3':'选取部分改进节点，并非全部提交 · 表 3',
  'Evaluation':'评测','Policy change':'策略变化','Condition':'实验条件','Replay feedback':'回放反馈','Opponent selection':'对手选择',
  'Batch size':'批量大小','Opponents':'对手','Replay learning · GLM-5.3':'回放学习 · GLM-5.3','Replay source':'回放来源','On-policy':'自身策略回放','Off-policy':'其他策略回放',
  'Main-run token use':'主实验 token 用量','Millions · Table 9':'单位：百万 · 表 9','Input + output tokens (M)':'输入 + 输出 token（百万）',
  'Ablation studies':'消融实验','GLM-5.3 · 128 / 16 budget':'GLM-5.3 · 128 / 16 预算','Retained champions · 128 / 16 budget · Table 2':'保留的最佳策略 · 128 / 16 预算 · 表 2',
  'Dense replays improve Elo in all three reported games.':'在报告的三个游戏中，详细回放均提高了 Elo。',
  'Model-selected and ladder opponents outperform top-four-only selection in these runs.':'这些实验中，模型选择和天梯选择均优于只选择前四名对手。',
  'The best batch sizes are 4 for Pacman and Miracle, and 2 for AntWar.':'Pacman 和 Miracle 的最佳批量大小为 4，AntWar 为 2。',
  'Exact values':'具体数值','Reference':'参照组','Best condition':'最佳条件','Highest Elo':'最高 Elo','Dense replays':'详细回放','Binary feedback':'仅胜负反馈',
  'Ladder':'天梯选择','Random':'随机选择','Top-4':'前四名','1 opponent':'1 个对手','2 opponents':'2 个对手','4 opponents':'4 个对手','8 opponents':'8 个对手',
  'Median of 3 runs. Opus5.5 uses Claude Code; other models use Codex. Elo is comparable within a game, not across games.':'取 3 次运行的中位数。Opus5.5 使用 Claude Code，其余模型使用 Codex。Elo 仅适合在同一游戏内比较，不可跨游戏比较。',
  'Table 2 · Median of 3 runs · 128 / 16 budget. Opus5.5: Claude Code; other models: Codex.':'表 2 · 3 次运行的中位数 · 128 / 16 预算。Opus5.5：Claude Code；其余模型：Codex。',
  'Ranks are measured against the human pool. Each model is evaluated independently.':'排名相对于人类选手池计算，每个模型分别独立评测。',
  'Student Association for Science and Technology':'清华大学计算机系学生科协','Department of Computer Science and Technology, Tsinghua University':'清华大学计算机科学与技术系','Department of Computer Science and Technology':'计算机科学与技术系',
  'The association’s Agent Department organizes the Tsinghua Agent Competition, the source of the games and archived human programs.':'科协智能体部组织清华大学智能体大赛。本项目的游戏与归档人类选手程序来自历届比赛。',
  'Visit SAST':'访问科协网站','Project leads':'项目负责人','Game not found':'未找到该游戏','Browse all games':'浏览全部游戏',
  'Iteration':'迭代流程','Pause':'暂停','Play':'播放','Pause animation':'暂停动画','Play animation':'播放动画','Policy iteration':'策略迭代',
  'Policy':'策略','Matches':'对局','Replays':'回放','Workflow illustration':'流程示意','Write  →  Evaluate  →  Revise':'编写 → 评测 → 修改',
  'Full-pool evaluation':'整池评测','Selected champion milestones · Paper Table 3':'最佳策略的部分改进节点 · 论文表 3',
  'Animation':'动画','Research sections':'研究章节','Game details':'游戏详情','Result metric':'结果指标','Ablation experiment':'消融设置',
  'Policy iteration illustration':'策略迭代示意图','Schematic policy, match and replay iteration. Not actual gameplay.':'策略、对局与回放的迭代流程示意，并非真实游戏画面。',
  'Dorado GLM-5.3, measured champion progress from pool rank 41 to 2.':'Dorado 中 GLM-5.3 最佳策略的实测进展：池内排名从 41 上升至 2。',
  'A coding agent revises an executable policy, which plays frozen human opponents. Match replays and full-pool rankings feed back into the next revision.':'编程智能体修改可执行策略，与固定的人类选手池对战，再根据回放和整池排名进行下一次改进。',
  'Per-game model results':'各游戏的模型结果','Results table':'结果表','Main experimental results, paper Table 2':'主要实验结果，论文表 2',
  'Paper Table 2: human-pool rank and Elo for each game and model. Summary counts gold medals, not an overall model ranking.':'论文表 2：各模型在各游戏中的人类池排名与 Elo。汇总行统计金牌数，并非模型综合排名。',
  'Main-stage records':'主实验记录','Continuation results':'追加迭代结果','Dorado champion milestones':'Dorado 最佳策略改进节点','Ablation records':'消融实验记录',
  'Figure 13 replay-learning results':'图 13 回放学习结果','Per-game token consumption':'各游戏 token 用量',
  'The first full-pool evaluation establishes the starting point.':'首次整池评测确定起点。','Keep mining; attack only a vulnerable enemy base.':'保持采矿，仅攻击防守薄弱的敌方基地。',
  'Use all living heroes to defend a serious threat.':'遇到严重威胁时，调动全部存活英雄防守。','Trigger full defence for active threats or recent base hits.':'根据当前威胁或基地近期受击情况触发全面防守。',
  'Exclude dead miners from occupancy and spread assignments.':'分配矿点时排除已死亡的采矿者，并分散任务。','Increase the penalty for sending multiple miners to one mine.':'加大多个采矿者重复前往同一矿点的惩罚。',
  'Track opening windows and prioritize mines that are actually open.':'跟踪矿点开放时间，优先分配实际可采的矿点。','Concentrate upgrades on two heroes while preserving mining income.':'在保留采矿收入的同时，将升级集中在两个核心英雄上。',
  'Allow a one-hero counterattack only after sustained nearby aggression.':'仅在附近遭受持续进攻后，允许一名英雄反击。'
 }));
 words.set(window.ARENA.paper.abstract,'对抗游戏中的 AI 已从启发式搜索发展到强化学习，但高效适应不同对手仍是一项挑战。基于启发式学习（HL），我们形式化提出对抗式启发学习（AHL）：在基础模型权重固定的情况下，AI 智能体通过游戏反馈改进可执行策略及其配套软件。我们提出 AAArena，涵盖 12 个真实比赛游戏与归档的人类选手程序，在独立的小规模对局和整池评测预算下考察策略开发能力。对 7 个 AI 模型的评测表明，使用 Claude Code 的 Opus5.5 获得了 6 枚金牌，但在其余 6 个人类选手天梯中，没有参评模型达到第一名。案例与轨迹分析揭示了理解复杂规则、实现有效策略和规划长期改进等持续存在的困难。进一步实验显示，智能体既能利用自身策略的回放，也能利用其他策略的回放来改进；详细反馈的效果优于仅提供胜负的反馈。');
 const score1='Results are retained champions from Table 2 of the paper, using 128 small-match units and 16 full-pool evaluations. Each model’s program is evaluated independently against a frozen human ladder; rank is its insertion position in that ladder. Elo is fitted with fixed opponent ratings and one virtual draw at the pool mean. The score retains the highest officially evaluated Elo, including the common initialization baseline. The main table reports the median of three runs per setting. All models use max reasoning effort; Opus5.5 uses Claude Code and the other six use Codex, so comparisons involve both model and harness.';
 words.set(score1,'结果来自论文表 2 中保留的最佳策略，预算为 128 个小规模对局单位及 16 次整池评测。各模型的程序分别对固定人类天梯进行评测，排名是其插入该天梯后的位置。Elo 在固定对手评分的条件下拟合，并在选手池均分处加入一次虚拟平局。保留最高正式评测 Elo，包括公共初始化基线。主表取每组 3 次运行的中位数。所有模型均使用最高推理强度；Opus5.5 使用 Claude Code，其余六个模型使用 Codex，因此比较同时涉及模型和运行框架。');
 words.set('Gold medal counts follow the summary row in Table 2. Elo is comparable within a game; no cross-game score or overall model ranking is computed. Continuation and off-policy runs are excluded from this main leaderboard. A gold medal means rank 1 under the fixed-pool rating protocol, not a proven head-to-head win over the human leader or optimal play.','金牌数对应论文表 2 的汇总行。Elo 仅在同一游戏内可比；本榜单不计算跨游戏总分或模型综合排名。追加预算与其他策略回放实验不计入主榜。金牌表示在固定选手池评分协议下排名第一，不意味着已证明能在直接对战中战胜人类榜首，也不意味着达到了最优策略。');
 const patterns=[
  [/^(\d[\d,]*) human programs · Sorted by Elo$/,m=>`${m[1]} 个人类选手程序 · 按 Elo 排序`],
  [/^(\d[\d,]*) human programs$/,m=>`${m[1]} 个人类选手程序`],
  [/^(\d[\d,]*) programs$/,m=>`${m[1]} 个程序`],
  [/^programs$/,()=> '个程序'],
  [/^(\d+) \/ 12 games$/,m=>`${m[1]} / 12 个游戏`],
  [/^Exported (\d+) results$/,m=>`已导出 ${m[1]} 条结果`],
  [/^Evaluation (\d+)$/,m=>`第 ${m[1]} 次评测`],
  [/^Elo ([\d.-]+) · pool rank (\d+)$/,m=>`Elo ${m[1]} · 池内排名 ${m[2]}`],
  [/^Reference: (.+)$/,m=>`参照组：${translate(m[1])}`],
  [/^Table (\d+)$/,m=>`表 ${m[1]}`],
  [/^Separate GLM-5.3 ablation runs · Table (\d+)$/,m=>`独立的 GLM-5.3 消融实验 · 表 ${m[1]}`],
  [/^(\d+) of 12 ladders topped\. Opus5\.5 earns 6 gold medals; the other 6 ladders remain untopped\.$/,m=>`在 12 个天梯中登顶 ${m[1]} 个。Opus5.5 获得 6 枚金牌；其余 6 个天梯尚无参评模型登顶。`],
  [/^Ranks are insertion positions among (\d+) human programs\. Each model is evaluated independently\.$/,m=>`排名表示插入 ${m[1]} 个人类选手程序后的位次。每个模型均独立评测。`],
  [/^Δ = Elo change from the reference within each game\. Elo is not comparable across games\. Separate ablation settings; not main-table cells\. Table (\d+)\.$/,m=>`Δ 表示同一游戏内相对参照组的 Elo 变化。不同游戏的 Elo 不可直接比较。此处为独立消融设置，并非主表结果。表 ${m[1]}。`],
  [/^(.+) details$/,m=>`${m[1]} 详情`],
  [/^(.+): best pool rank (\d+)\. View results$/,m=>`${m[1]}：最佳池内排名 ${m[2]}。查看结果`],
  [/^Reported model champions in (.+), ordered by Elo; ranks are positions in the human pool$/,m=>`${m[1]} 中各模型的最佳策略，按 Elo 排序；排名表示在人类池中的位次`]
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
