const express = require('express');
const router = express.Router();

let idCounter = Date.now();
function genId() {
  return 'node_' + (++idCounter);
}

// POST /api/ai/understand - Parse description into workflow nodes
router.post('/understand', (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: '请输入需求描述' });
    }

    const nodes = generateNodesFromDescription(description);
    const name = generateNameFromDescription(description);
    const icon = generateIconFromDescription(description);
    const category = generateCategoryFromDescription(description);

    res.json({ name, icon, category, nodes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate - Generate final output from workflow answers
router.post('/generate', (req, res) => {
  try {
    const { skillName, nodes, answers } = req.body;
    if (!nodes || !answers) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const result = generateOutput(skillName || '自定义工作流', nodes, answers);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Helper: Generate nodes from description ───────────────────────────────

function generateNodesFromDescription(desc) {
  const lower = desc.toLowerCase();
  const nodes = [];

  const isPhoto = /写真|照片|拍摄|图片|图组|组图|摄影|photo|image|picture|生成图/.test(lower);
  const isSwimwear = /泳装|泳衣|比基尼|swimwear|bikini|游泳/.test(lower);
  const isProduct = /商品|产品|电商|淘宝|product|ecommerce|商业|brand/.test(lower);
  const isWriting = /文章|写作|博客|内容|文字|essay|blog|article|content|writing/.test(lower);
  const isTravel = /旅行|旅游|攻略|出行|travel|trip|vacation|destination/.test(lower);
  const isCode = /代码|编程|开发|程序|功能|api|code|programming|develop|feature/.test(lower);
  const isRecipe = /食谱|菜谱|烹饪|做菜|料理|recipe|cooking|food/.test(lower);
  const isMarketing = /营销|广告|文案|推广|marketing|copy|ad|campaign/.test(lower);

  if (isSwimwear || (isPhoto && !isProduct)) {
    nodes.push({
      id: genId(), type: 'select', label: '人物性别',
      description: '选择拍摄对象的性别',
      options: isSwimwear ? ['女生', '男生', '情侣'] : ['女生', '男生', '不限'],
      required: true
    });

    if (isSwimwear) {
      nodes.push({
        id: genId(), type: 'select', label: '泳装颜色',
        description: '选择泳装的主要颜色',
        options: ['黑色', '白色', '红色', '蓝色', '花纹/印花', '荧光色', '随机'],
        required: false
      });
    }

    nodes.push({
      id: genId(), type: 'select', label: '拍摄场景',
      description: '选择主要拍摄场景',
      options: isSwimwear
        ? ['海边沙滩', '室外泳池', '室内泳池', '热带度假村', '游艇甲板']
        : ['城市街头', '自然户外', '室内摄影棚', '咖啡厅', '古典建筑'],
      required: true
    });

    nodes.push({
      id: genId(), type: 'multi-select', label: '风格偏好',
      description: '选择照片风格（可多选）',
      options: isSwimwear
        ? ['清爽活力', '性感魅力', '休闲度假', '运动竞技', '时尚大片']
        : ['清新自然', '时尚大片', '日系小清新', '欧美风', '复古胶片'],
      required: false
    });

    nodes.push({
      id: genId(), type: 'select', label: '生成数量',
      description: '希望生成几张图片',
      options: ['1张', '3张', '5张', '10张'],
      required: true
    });

    nodes.push({
      id: genId(), type: 'textarea', label: '其他要求',
      description: '输入额外的特殊要求（服装细节、表情、道具等）',
      placeholder: '例如：穿着白色连衣裙，背对镜头，阳光照射效果...',
      required: false
    });
  }

  if (isProduct) {
    nodes.push({
      id: genId(), type: 'text', label: '产品名称',
      description: '输入要拍摄的产品名称',
      placeholder: '例如：无线蓝牙耳机、手提包...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '拍摄风格',
      description: '选择产品图的整体风格',
      options: ['简洁白底', '场景生活化', '创意艺术', '奢华大气', '清新自然'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '主色调',
      description: '选择图片的主要色调',
      options: ['白色/浅色系', '黑色/深色系', '暖色调', '冷色调', '彩色缤纷'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'multi-select', label: '拍摄角度',
      description: '需要哪些拍摄角度（可多选）',
      options: ['正面', '侧面', '45度角', '俯拍', '细节特写'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'textarea', label: '产品特点',
      description: '描述产品的核心卖点或特色',
      placeholder: '例如：轻薄设计、防水材质、限量配色...',
      required: false
    });
  }

  if (isWriting) {
    nodes.push({
      id: genId(), type: 'text', label: '文章主题',
      description: '输入文章的核心主题或标题关键词',
      placeholder: '例如：如何提高工作效率...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '文章风格',
      description: '选择写作风格',
      options: ['专业严谨', '轻松幽默', '故事叙述', '说明教程', '情感抒发'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '目标读者',
      description: '文章面向的读者群体',
      options: ['大众读者', '专业人士', '年轻人', '学生', '企业主管'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '文章长度',
      description: '期望的文章字数',
      options: ['简短 (~300字)', '中等 (~800字)', '详细 (~1500字)', '长篇 (~3000字)'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'textarea', label: '关键要点',
      description: '列出需要包含的关键信息或要点',
      placeholder: '例如：1. 时间管理技巧 2. 减少干扰 3. 专注工具推荐...',
      required: false
    });
  }

  if (isTravel) {
    nodes.push({
      id: genId(), type: 'text', label: '目的地',
      description: '输入旅行目的地（城市或国家）',
      placeholder: '例如：日本东京、泰国清迈...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '旅行天数',
      description: '计划旅行的天数',
      options: ['3天以内', '4-5天', '6-7天', '1-2周', '2周以上'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '预算范围',
      description: '人均旅行预算',
      options: ['经济实惠 (<3000元)', '中等 (3000-8000元)', '舒适 (8000-20000元)', '奢华 (>20000元)'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'multi-select', label: '旅行偏好',
      description: '选择感兴趣的活动（可多选）',
      options: ['美食探索', '自然风光', '历史文化', '购物血拼', '户外冒险', '海岛休闲'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '出行人数',
      description: '参与旅行的人数',
      options: ['独自旅行', '双人旅行', '3-5人小团', '家庭出游', '多人团队'],
      required: true
    });
  }

  if (isCode) {
    nodes.push({
      id: genId(), type: 'select', label: '编程语言',
      description: '选择目标编程语言',
      options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '框架/库',
      description: '使用的框架或库（如适用）',
      options: ['React', 'Vue', 'Angular', 'Express/Node', 'FastAPI', 'Django', '无/其他'],
      required: false
    });
    nodes.push({
      id: genId(), type: 'textarea', label: '功能描述',
      description: '详细描述需要实现的功能',
      placeholder: '例如：实现一个用户登录验证功能，支持JWT token...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'multi-select', label: '代码要求',
      description: '代码的额外要求（可多选）',
      options: ['添加注释', '错误处理', '单元测试', '性能优化', 'TypeScript类型'],
      required: false
    });
  }

  if (isRecipe) {
    nodes.push({
      id: genId(), type: 'text', label: '菜品名称',
      description: '输入想要学做的菜品名称',
      placeholder: '例如：红烧肉、西红柿炒鸡蛋...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '烹饪难度',
      description: '选择可接受的烹饪难度',
      options: ['入门级（简单易学）', '中级（需要一定技巧）', '进阶（专业烹饪）'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '用餐人数',
      description: '为几个人准备',
      options: ['1-2人份', '3-4人份', '5-6人份', '6人以上'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'multi-select', label: '饮食限制',
      description: '有哪些饮食限制或偏好（可多选）',
      options: ['素食', '无麸质', '低糖', '低脂', '无辣', '无过敏原'],
      required: false
    });
  }

  if (isMarketing) {
    nodes.push({
      id: genId(), type: 'text', label: '产品/服务名称',
      description: '输入要推广的产品或服务名称',
      placeholder: '例如：智能手表、在线英语课程...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '目标平台',
      description: '选择主要投放平台',
      options: ['微信朋友圈', '小红书', '抖音/TikTok', '微博', 'Instagram', '邮件营销'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '文案风格',
      description: '选择文案的整体风格',
      options: ['专业权威', '亲切温暖', '幽默创意', '激励励志', '简洁直接'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'text', label: '目标受众',
      description: '描述目标用户画像',
      placeholder: '例如：25-35岁都市白领，关注健康生活方式...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'textarea', label: '核心卖点',
      description: '列出产品/服务的核心优势和卖点',
      placeholder: '例如：比同类产品便宜30%、7天无理由退换货...',
      required: true
    });
  }

  // Fallback: generic workflow
  if (nodes.length === 0) {
    nodes.push({
      id: genId(), type: 'textarea', label: '需求描述',
      description: '详细描述你的需求',
      placeholder: '请详细描述你想要生成的内容...',
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '输出风格',
      description: '选择输出内容的整体风格',
      options: ['正式专业', '轻松随意', '创意个性', '简洁明了'],
      required: true
    });
    nodes.push({
      id: genId(), type: 'select', label: '输出详细程度',
      description: '选择输出内容的详细程度',
      options: ['简短概要', '适中详细', '全面详尽'],
      required: true
    });
  }

  return nodes;
}

function generateNameFromDescription(desc) {
  const map = [
    [/泳装|比基尼|泳衣/, '泳装写真工作流'],
    [/写真|人像|肖像/, '人像摄影工作流'],
    [/商品|产品|电商|淘宝/, '商品拍摄工作流'],
    [/照片|图片|摄影/, '摄影工作流'],
    [/文章|写作|博客/, '文章创作工作流'],
    [/旅行|旅游|攻略/, '旅行攻略工作流'],
    [/代码|编程|开发/, '代码生成工作流'],
    [/食谱|菜谱|烹饪/, '食谱生成工作流'],
    [/营销|广告|文案/, '营销文案工作流'],
  ];
  for (const [pattern, name] of map) {
    if (pattern.test(desc)) return name;
  }
  const trimmed = desc.trim().slice(0, 12);
  return trimmed + (desc.length > 12 ? '...' : '') + ' 工作流';
}

function generateIconFromDescription(desc) {
  const map = [
    [/泳装|泳衣|比基尼|游泳/, '🏊'],
    [/照片|写真|摄影|拍摄/, '📸'],
    [/商品|产品|电商/, '📦'],
    [/文章|写作|博客/, '✍️'],
    [/旅行|旅游|出行/, '✈️'],
    [/代码|编程|开发/, '💻'],
    [/食谱|菜谱|烹饪/, '🍳'],
    [/营销|广告|文案/, '📢'],
  ];
  for (const [pattern, icon] of map) {
    if (pattern.test(desc)) return icon;
  }
  return '🎯';
}

function generateCategoryFromDescription(desc) {
  const map = [
    [/泳装|照片|写真|摄影|拍摄|商品|产品/, '摄影'],
    [/文章|写作|博客|内容|文字/, '写作'],
    [/旅行|旅游|出行/, '旅行'],
    [/代码|编程|开发/, '开发'],
    [/食谱|菜谱|烹饪/, '生活'],
    [/营销|广告|文案/, '营销'],
  ];
  for (const [pattern, cat] of map) {
    if (pattern.test(desc)) return cat;
  }
  return '通用';
}

// ─── Helper: Generate output from answers ──────────────────────────────────

function getAnswer(answers, nodes, label) {
  const node = nodes.find(n => n.label === label);
  if (!node) return null;
  const val = answers[node.id];
  return val;
}

function generateOutput(skillName, nodes, answers) {
  const lower = skillName.toLowerCase();
  let intro = `根据你在「${skillName}」中的配置，已生成以下内容：\n\n`;
  intro += `**你的选择：**\n`;
  nodes.forEach(node => {
    const answer = answers[node.id];
    if (answer !== undefined && answer !== null && answer !== '') {
      const str = Array.isArray(answer) ? answer.join('、') : String(answer);
      if (str.trim()) intro += `- **${node.label}**：${str}\n`;
    }
  });
  intro += '\n---\n\n';

  if (/泳装|写真|摄影|照片|拍摄|图片/.test(lower)) {
    return intro + generatePhotoPrompt(skillName, nodes, answers);
  } else if (/文章|写作|博客/.test(lower)) {
    return intro + generateWritingPrompt(skillName, nodes, answers);
  } else if (/旅行|旅游|攻略/.test(lower)) {
    return intro + generateTravelPrompt(skillName, nodes, answers);
  } else if (/代码|编程|开发/.test(lower)) {
    return intro + generateCodePrompt(skillName, nodes, answers);
  } else if (/食谱|菜谱|烹饪/.test(lower)) {
    return intro + generateRecipePrompt(skillName, nodes, answers);
  } else if (/营销|广告|文案/.test(lower)) {
    return intro + generateMarketingPrompt(skillName, nodes, answers);
  } else {
    return intro + generateGenericPrompt(skillName, nodes, answers);
  }
}

function generatePhotoPrompt(skillName, nodes, answers) {
  const gender = getAnswer(answers, nodes, '人物性别') || '女生';
  const scene = getAnswer(answers, nodes, '拍摄场景') || '';
  const style = getAnswer(answers, nodes, '风格偏好');
  const styleStr = Array.isArray(style) ? style.join('、') : (style || '清新自然');
  const color = getAnswer(answers, nodes, '泳装颜色') || '';
  const count = getAnswer(answers, nodes, '生成数量') || '3张';
  const extra = getAnswer(answers, nodes, '其他要求') || '';

  const genderEn = gender === '女生' ? 'beautiful young woman' : gender === '男生' ? 'handsome young man' : 'attractive couple';
  const sceneMap = {
    '海边沙滩': 'tropical beach, white sand, turquoise ocean, golden hour',
    '室外泳池': 'luxury outdoor swimming pool, crystal clear water, poolside',
    '室内泳池': 'modern indoor swimming pool, dramatic lighting, reflections',
    '热带度假村': 'tropical resort, palm trees, exotic lush setting',
    '游艇甲板': 'luxury yacht deck, open sea, horizon',
    '城市街头': 'urban street, city background, natural light',
    '自然户外': 'natural outdoor setting, lush greenery, soft sunlight',
    '室内摄影棚': 'professional studio, clean backdrop, controlled lighting',
  };
  const sceneEn = sceneMap[scene] || scene || 'beautiful outdoor setting';

  const styleMap = {
    '清爽活力': 'fresh energetic, bright colors, candid natural pose',
    '性感魅力': 'glamorous, confident pose, dramatic lighting, editorial',
    '休闲度假': 'relaxed vacation mood, casual natural pose, warm colors',
    '运动竞技': 'sporty athletic, dynamic action pose, energetic',
    '时尚大片': 'high fashion editorial, professional lighting, magazine style',
    '清新自然': 'natural light, soft shadows, authentic candid',
    '日系小清新': 'Japanese aesthetic, soft tones, minimalist, film grain',
    '欧美风': 'western fashion style, bold composition, strong lighting',
    '复古胶片': 'vintage film photography, grain texture, muted tones',
  };

  let styleEn = '';
  const styleItems = Array.isArray(style) ? style : (style ? [style] : ['清新自然']);
  styleItems.forEach(s => { if (styleMap[s]) styleEn += styleMap[s] + ', '; });
  styleEn = styleEn || 'natural style, professional quality';

  const colorPart = color && color !== '随机' ? `${color} swimwear, ` : 'stylish swimwear, ';
  const extraPart = extra ? `${extra}, ` : '';

  let out = `🎨 **AI 图片生成提示词**\n\n`;
  out += `以下是根据你的配置生成的专业提示词，可直接用于 Midjourney、Stable Diffusion、DALL-E 等工具：\n\n`;
  out += `**正向提示词 (Positive Prompt)：**\n\`\`\`\n`;
  out += `${genderEn}, ${colorPart}${sceneEn}, ${styleEn}${extraPart}photorealistic, 8k uhd, professional photography, sharp focus, beautiful composition, perfect lighting\n\`\`\`\n\n`;
  out += `**负向提示词 (Negative Prompt)：**\n\`\`\`\nbad anatomy, bad hands, missing fingers, extra limbs, blurry, low quality, watermark, text, ugly, deformed, disfigured\n\`\`\`\n\n`;
  out += `**推荐参数：**\n- 宽高比：\`--ar 2:3\` (竖版人像)\n- 质量：\`--q 2\`\n- 风格：\`--style raw\`\n\n`;
  out += `**建议生成数量：** ${count}\n\n`;
  out += `> 💡 **提示**：将以上正向/负向提示词复制到你的 AI 绘图工具中，即可开始生成。每次生成结果可能略有不同，建议多次生成选取最满意的。`;
  return out;
}

function generateWritingPrompt(skillName, nodes, answers) {
  const topic = getAnswer(answers, nodes, '文章主题') || '（请填写主题）';
  const style = getAnswer(answers, nodes, '文章风格') || '轻松幽默';
  const audience = getAnswer(answers, nodes, '目标读者') || '大众读者';
  const length = getAnswer(answers, nodes, '文章长度') || '中等 (~800字)';
  const keyPoints = getAnswer(answers, nodes, '关键要点') || '';

  let out = `📝 **文章写作 Prompt**\n\n`;
  out += `以下是为你生成的文章写作提示词，可直接发送给 Claude、ChatGPT 或其他 AI 写作助手：\n\n`;
  out += `---\n\n`;
  out += `你是一位专业的内容创作者。请为我创作一篇关于「**${topic}**」的文章，要求如下：\n\n`;
  out += `- **写作风格**：${style}\n`;
  out += `- **目标读者**：${audience}\n`;
  out += `- **文章长度**：${length}\n`;
  if (keyPoints) {
    out += `- **需要涵盖的要点**：\n`;
    keyPoints.split('\n').forEach(p => { if (p.trim()) out += `  - ${p.trim()}\n`; });
  }
  out += `\n请确保：\n`;
  out += `1. 文章结构清晰，有引人入胜的标题和开头\n`;
  out += `2. 正文论点充实，有具体的案例或数据支撑\n`;
  out += `3. 结尾有力，给读者留下深刻印象\n`;
  out += `4. 语言流畅，符合目标读者的阅读习惯\n`;
  return out;
}

function generateTravelPrompt(skillName, nodes, answers) {
  const dest = getAnswer(answers, nodes, '目的地') || '（目的地）';
  const days = getAnswer(answers, nodes, '旅行天数') || '5天';
  const budget = getAnswer(answers, nodes, '预算范围') || '中等';
  const prefs = getAnswer(answers, nodes, '旅行偏好');
  const prefStr = Array.isArray(prefs) ? prefs.join('、') : (prefs || '');
  const people = getAnswer(answers, nodes, '出行人数') || '双人旅行';

  let out = `🗺️ **旅行攻略 Prompt**\n\n`;
  out += `以下是为你生成的旅行规划提示词，可直接发送给 AI 助手获取详细攻略：\n\n`;
  out += `---\n\n`;
  out += `你是一位经验丰富的旅行规划师。请为我制定一份 **${dest}** 的详细旅行攻略：\n\n`;
  out += `**行程基本信息：**\n`;
  out += `- 旅行天数：${days}\n`;
  out += `- 预算范围：${budget}\n`;
  out += `- 出行人数：${people}\n`;
  if (prefStr) out += `- 兴趣偏好：${prefStr}\n`;
  out += `\n**请包含以下完整内容：**\n`;
  out += `1. 📅 **每日详细行程**（具体景点、参观时长、交通方式）\n`;
  out += `2. 🏨 **住宿推荐**（区域选择、酒店档次、参考价格）\n`;
  out += `3. 🍽️ **美食推荐**（必吃菜肴、餐厅推荐、人均消费）\n`;
  out += `4. 🚆 **交通指南**（往返交通、市内交通、交通卡办理）\n`;
  out += `5. 💰 **预算明细**（按类别列出预估花费）\n`;
  out += `6. ⚠️ **注意事项**（签证、气候、文化禁忌、安全提示）\n`;
  out += `7. 📱 **实用 APP 推荐**（当地常用的出行、翻译、地图应用）\n`;
  return out;
}

function generateCodePrompt(skillName, nodes, answers) {
  const lang = getAnswer(answers, nodes, '编程语言') || 'JavaScript';
  const framework = getAnswer(answers, nodes, '框架/库') || '无';
  const feature = getAnswer(answers, nodes, '功能描述') || '';
  const reqs = getAnswer(answers, nodes, '代码要求');
  const reqStr = Array.isArray(reqs) ? reqs.join('、') : (reqs || '');

  let out = `💻 **代码生成 Prompt**\n\n`;
  out += `以下是为你生成的代码请求提示词：\n\n---\n\n`;
  out += `你是一位资深的 ${lang} 开发工程师。请帮我实现以下功能：\n\n`;
  if (feature) {
    out += `**功能需求：**\n${feature}\n\n`;
  }
  if (framework && framework !== '无' && framework !== '无/其他') {
    out += `**技术栈：** ${lang} + ${framework}\n\n`;
  }
  if (reqStr) {
    out += `**代码要求：**\n`;
    reqStr.split('、').forEach(r => { out += `- ${r}\n`; });
    out += '\n';
  }
  out += `**请提供：**\n`;
  out += `1. 完整的代码实现\n`;
  out += `2. 简要的代码说明和工作原理\n`;
  out += `3. 使用示例\n`;
  if (reqStr.includes('单元测试')) out += `4. 基础的单元测试代码\n`;
  return out;
}

function generateRecipePrompt(skillName, nodes, answers) {
  const dish = getAnswer(answers, nodes, '菜品名称') || '（菜品名称）';
  const difficulty = getAnswer(answers, nodes, '烹饪难度') || '入门级';
  const servings = getAnswer(answers, nodes, '用餐人数') || '2人份';
  const restrictions = getAnswer(answers, nodes, '饮食限制');
  const restStr = Array.isArray(restrictions) ? restrictions.join('、') : (restrictions || '无');

  let out = `🍳 **食谱生成 Prompt**\n\n`;
  out += `以下是为你生成的食谱请求提示词：\n\n---\n\n`;
  out += `你是一位专业的厨师和美食博主。请为我提供「**${dish}**」的详细制作食谱：\n\n`;
  out += `- **用餐人数**：${servings}\n`;
  out += `- **难度要求**：${difficulty}\n`;
  if (restStr !== '无') out += `- **饮食限制**：${restStr}\n`;
  out += `\n**请包含：**\n`;
  out += `1. 📋 **食材清单**（用量精确到克/个）\n`;
  out += `2. 🔪 **事前准备**（食材预处理步骤）\n`;
  out += `3. 👨‍🍳 **烹饪步骤**（详细分步说明，包括火候和时间）\n`;
  out += `4. ✨ **成品特点**（口感、颜色描述）\n`;
  out += `5. 💡 **小贴士**（常见错误和注意事项）\n`;
  return out;
}

function generateMarketingPrompt(skillName, nodes, answers) {
  const product = getAnswer(answers, nodes, '产品/服务名称') || '（产品名称）';
  const platform = getAnswer(answers, nodes, '目标平台') || '微信朋友圈';
  const style = getAnswer(answers, nodes, '文案风格') || '亲切温暖';
  const audience = getAnswer(answers, nodes, '目标受众') || '';
  const points = getAnswer(answers, nodes, '核心卖点') || '';

  let out = `📢 **营销文案 Prompt**\n\n`;
  out += `以下是为你生成的营销文案创作提示词：\n\n---\n\n`;
  out += `你是一位资深的数字营销文案专家，擅长为 ${platform} 平台创作高转化率内容。\n\n`;
  out += `请为「**${product}**」创作一套完整的营销文案：\n\n`;
  if (audience) out += `**目标受众**：${audience}\n`;
  out += `**文案风格**：${style}\n`;
  out += `**投放平台**：${platform}\n`;
  if (points) out += `**核心卖点**：\n${points}\n`;
  out += `\n**请提供：**\n`;
  out += `1. 🎯 **主标题**（吸引眼球，5-15字）\n`;
  out += `2. 📣 **副标题/引导语**（补充说明，20-30字）\n`;
  out += `3. 📝 **正文内容**（符合平台调性，突出卖点）\n`;
  out += `4. #️⃣ **话题标签**（5-10个相关标签）\n`;
  out += `5. 📲 **行动召唤 (CTA)**（引导用户下一步行动）\n`;
  return out;
}

function generateGenericPrompt(skillName, nodes, answers) {
  let out = `✨ **AI 生成 Prompt**\n\n`;
  out += `根据你在「${skillName}」中的配置，以下是整理好的完整提示词：\n\n---\n\n`;
  out += `请根据以下具体要求，为我生成高质量的内容：\n\n`;
  nodes.forEach(node => {
    const answer = answers[node.id];
    if (answer !== undefined && answer !== null) {
      const str = Array.isArray(answer) ? answer.join('、') : String(answer);
      if (str.trim()) out += `**${node.label}**：${str}\n`;
    }
  });
  out += `\n请确保输出内容：\n`;
  out += `- 准确理解并满足以上所有要求\n`;
  out += `- 内容详实、有价值，质量上乘\n`;
  out += `- 格式清晰、易于阅读\n`;
  return out;
}

module.exports = router;
