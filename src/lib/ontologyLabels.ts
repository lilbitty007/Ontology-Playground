/** Chinese display labels keyed by English name without spaces, hyphens or underscores. */
const entity: Readonly<Record<string, string>> = {
  account: '账户', appointment: '预约', borrower: '借款人', buyer: '买家',
  carrier: '承运商', coldchainsensor: '冷链传感器', collateral: '抵押品',
  collateraltype: '抵押品类型', concentrationcategory: '集中度类别', country: '国家',
  course: '课程', customer: '客户', demandsignal: '需求信号', department: '院系',
  diagnosis: '诊断', enrollment: '选课', farm: '农场', forecast: '预测',
  fruitvariety: '水果品种', grower: '种植户', harvestlot: '采收批次',
  industrygroup: '行业组', inventory: '库存', investment: '投资',
  jurisdiction: '司法辖区', lender: '贷款方', lenderlienposition: '贷款方留置权顺位',
  loan: '贷款', loanpaymentschedule: '贷款还款计划', loantype: '贷款类型',
  machine: '机器', order: '订单', orderline: '订单明细', ownershipinterest: '所有权权益',
  part: '零件', patient: '患者', paymenthistory: '付款记录', paymenttransaction: '付款交易',
  plot: '地块', prescription: '处方', product: '商品', productcategory: '商品类别',
  professor: '教授', promotion: '促销', provider: '医疗服务提供者', qualitycheck: '质量检查',
  region: '地区', regulation: '法规', regulatorylimit: '监管限额', retaildc: '零售配送中心',
  return: '退货', review: '评价', sector: '行业', sensor: '传感器', servicer: '贷款服务商',
  shipment: '货运', shoppingcart: '购物车', store: '门店', student: '学生',
  subsector: '细分行业', supplier: '供应商', sustainabilityprogram: '可持续发展计划',
  transaction: '交易', warehouse: '仓库', workorder: '工单',

  apple: '苹果', asset: '资产', batch: '批次', category: '类别', client: '客户',
  coffee: '咖啡', company: '公司', component: '组件', consumer: '消费者', contract: '合同',
  coupon: '优惠券', currency: '币种', defect: '缺陷', device: '设备', doctor: '医生',
  employee: '员工', event: '事件', factory: '工厂', ingredient: '原料', inspection: '检验',
  instructor: '教师', invoice: '发票', location: '地点', material: '物料', medication: '药品',
  merchant: '商户', organization: '组织', payment: '付款', person: '人员', policy: '政策',
  productionorder: '生产订单', recipe: '配方', retailer: '零售商', risk: '风险',
  route: '路线', semester: '学期', vehicle: '车辆', vendor: '供应商',
};

const relationship: Readonly<Record<string, string>> = {
  advisedby: '由其指导', belongsto: '属于', belongstosubsector: '属于细分行业',
  carries: '运载', classifiescollateralownership: '划分抵押品所有权类型',
  collateralclassifiedas: '抵押品归类为', contains: '包含', deliveredto: '配送至',
  demandsignalforproduct: '商品的需求信号', demandsignalinregion: '地区内的需求信号',
  diagnosedwith: '确诊为', diagnoses: '诊断', enrolledin: '选修', executes: '执行',
  farmcontainsplot: '农场包含地块', farmparticipatesinprogram: '农场参与计划',
  forcourse: '对应课程', forecastforproduct: '商品预测', funds: '提供资金',
  growerownsfarm: '种植户拥有农场', harvestlotfromplot: '采收批次来自地块',
  harvestlotofvariety: '采收批次对应水果品种', hasappointment: '有预约',
  hascart: '拥有购物车', hasloan: '有贷款', hastransaction: '有交易',
  hasindividualpayment: '包含单笔付款', haslienposition: '具有留置权顺位',
  haspaymenthistory: '有付款记录', holds: '持有', includes: '包含',
  incountry: '位于国家', inregion: '位于地区', inspectedby: '由其检验',
  inventoryatwarehouse: '库存位于仓库', inventoryforproduct: '商品的库存',
  limitappliestocategory: '限额适用于类别', linkedto: '关联到', loanclassifiedas: '贷款归类为',
  mandatedby: '由其规定', monitoredby: '由其监测', offeredby: '由其开设',
  ordercontainsproduct: '订单包含商品', orderforvariety: '订单对应水果品种',
  orderfulfilledtoregion: '订单履约至地区', orderhaslineitem: '订单包含明细',
  orderlinereferencesproduct: '订单明细对应商品', orderplacedbycustomer: '客户下单',
  originatedby: '由其发放', owedby: '由其偿还', owns: '拥有', partofsector: '属于行业',
  places: '下单', plotgrowsfruitvariety: '地块种植水果品种', prescribes: '开处方',
  processedat: '在此处理', productincategory: '商品属于类别',
  promotionforproduct: '商品促销', qualitycheckchecksharvestlot: '检验采收批次',
  repaidbyschedule: '按计划还款', requires: '需要', retaildcsuppliesstore: '零售配送中心向门店供货',
  returnfororder: '退货对应订单', returnofproduct: '退回商品', reviews: '评价',
  securedby: '由其担保', sees: '接诊', sentby: '由其发货', servicedby: '由其管理',
  shipmentbycarrier: '货运由承运商承运', shipmentcarriesharvestlot: '货运承载采收批次',
  shipmentdeliveredtoretaildc: '货运送达零售配送中心',
  shipmentdepartedfromwarehouse: '货运从仓库发出', shipmentfulfillsorder: '货运履行订单',
  shipmentmonitoredbysensor: '货运由传感器监测', sourcedfrom: '采购自',
  storeinregion: '门店位于地区', storeplacesorder: '门店下单', teaches: '授课',
  treatedby: '由其诊治', typicallysecuredby: '通常由其担保', uses: '使用', writes: '撰写',

  affect: '影响', affects: '影响', assignedto: '分配给', basedon: '基于',
  childof: '是其子项', connectsto: '连接到', createdby: '由其创建',
  dependson: '依赖', haspart: '包含部分', ispartof: '是其一部分',
  locatedin: '位于', managedby: '由其管理', memberof: '隶属于', partof: '是其一部分',
  relatedto: '关联到', subclassof: '是其子类', suppliedby: '由其供应',
};

const property: Readonly<Record<string, string>> = {
  accountnumber: '账号', address: '地址', allergies: '过敏史', amount: '金额',
  appraisedvalue: '评估价值', apr: '年化利率', arrivaldate: '到达日期', assettype: '资产类型',
  balance: '余额', baselriskweight: '巴塞尔风险权重', bloodtype: '血型', body: '正文',
  budget: '预算', building: '楼宇', capacity: '容量', capitaltier: '资本层级',
  carriername: '承运商名称', cartid: '购物车编号', category: '类别', categoryname: '类别名称', certification: '认证',
  checkedat: '检查时间', city: '城市', climatesensitivity: '气候敏感度', coastal: '是否沿海',
  code: '代码', coldchainrequired: '是否需要冷链', collateraltypecode: '抵押品类型代码',
  commercialname: '商品名称', country: '国家', countrycode: '国家代码', countryname: '国家名称',
  coursecode: '课程代码', createdat: '创建时间', credits: '学分', creditscore: '信用评分',
  currency: '币种', currentvalue: '当前价值', cyclicality: '周期性', dateofbirth: '出生日期',
  defectrate: '缺陷率', defecttype: '缺陷类型', deliverydate: '交付日期',
  department: '院系', departuredate: '出发日期', deptcode: '院系代码', description: '描述',
  diagnoseddate: '诊断日期', disasterprofile: '灾害概况', discountpercent: '折扣百分比',
  dispatchdate: '发货日期', dosage: '剂量', duedate: '到期日', duration: '时长',
  earthquakezone: '地震区', economiczone: '经济区', effectivedate: '生效日期',
  email: '电子邮箱', enrollmentyear: '入学年份', essentialservices: '基本服务',
  etadate: '预计到达日期', expectedpayments: '预期付款次数', floodzone: '洪水风险区',
  focusarea: '重点领域', forecastdate: '预测日期', frequency: '频率', gpa: '平均绩点',
  grade: '成绩', harvestdate: '采收日期', hectares: '面积（公顷）', humiditypct: '湿度百分比',
  hurricanezone: '飓风风险区', icdcode: 'ICD 编码', inspector: '检验员',
  interestrate: '利率', isactivepromotion: '促销是否有效', isinterestonly: '是否只付利息',
  ismastergrower: '是否为资深种植户', isorganic: '是否有机', issuingauthority: '发布机构',
  itemcount: '商品件数', joindate: '加入日期', kilograms: '重量（千克）',
  lastmaintenance: '最近维护时间', latitude: '纬度', lendertype: '贷款方类型',
  level: '级别', licensenumber: '执照号码', lienposition: '留置权顺位',
  lifetimevalue: '生命周期价值', limitname: '限额名称', linetotal: '明细金额',
  loantypecode: '贷款类型代码', location: '地点', longitude: '经度', loyaltytier: '会员等级',
  major: '专业', maxenrollment: '选课人数上限', maxstoragetempc: '最高储存温度（℃）',
  maxthreshold: '阈值上限', medication: '药品', membersince: '入会日期', merchant: '商户',
  minstoragetempc: '最低储存温度（℃）', minthreshold: '阈值下限', modality: '服务方式',
  model: '型号', mrn: '病历号码', naicscode: 'NAICS 行业代码', name: '名称',
  occguidance: 'OCC 指引', opendate: '开业日期', orderdate: '下单日期',
  organizationname: '机构名称', origin: '产地', ownershipinteresttype: '所有权权益类型',
  partnersince: '开始合作日期', partnumber: '零件编号', passed: '是否通过',
  paymentmethod: '支付方式', plantingyear: '种植年份', positionrank: '顺位等级',
  postedat: '入账时间', predicteddemand: '预测需求', price: '价格', principal: '本金',
  principalamount: '本金金额', priority: '优先级', product: '商品', promotionname: '促销名称',
  purchaseprice: '采购价格', qcgrade: '质检等级', quantity: '数量', rating: '评分',
  reason: '原因', recoveryexpectation: '预计回收情况', refillsremaining: '剩余续配次数',
  region: '地区', regioncode: '地区代码', regionname: '地区名称', regulationcode: '法规编号',
  regulatoryframework: '监管框架', regulatorytreatment: '监管处理方式',
  reorderpoint: '再订货点', researcharea: '研究领域', retailercode: '零售商代码',
  retailername: '零售商名称', returndate: '退货日期', riskprofile: '风险概况',
  rxnumber: '处方编号', scheduledtime: '预约时间', scope: '适用范围',
  sectorcode: '行业代码', sectorname: '行业名称', semester: '学期', sensormodel: '传感器型号',
  servicetype: '服务类型', severity: '严重程度', shares: '股数', shelflifedays: '保质期天数',
  shipdate: '发货日期', shippingmethod: '配送方式', signaldate: '信号日期',
  signalstrength: '信号强度', sku: '库存单位编码', specialty: '专科',
  ssn: '社会保障号码', stage: '阶段', startyear: '开始年份', state: '州或省',
  status: '状态', stocklevel: '库存水平', stockqty: '库存数量', storename: '门店名称',
  subsectorcode: '细分行业代码', subsectorname: '细分行业名称', subtotal: '小计',
  symbol: '交易代码', temperaturec: '温度（℃）', tenure: '任职年限', term: '期限',
  thresholdpct: '阈值百分比', timestamp: '时间戳', timezone: '时区', title: '标题',
  total: '合计', totalamount: '总金额', totalspend: '累计消费额', totalspent: '累计消费额',
  type: '类型', unit: '单位', unitcost: '单位成本', unitpriceeur: '单价（欧元）',
  verified: '是否已验证', warehousename: '仓库名称', weight: '重量', wildfirezone: '野火风险区',

  check: '检查', container: '集装箱', customizations: '定制选项', dc: '配送中心',
  enddate: '结束日期', faculty: '教职人员', holding: '持仓', id: '编号', limit: '限额',
  lot: '批次', phone: '电话号码', program: '计划', schedule: '计划', signal: '信号',
  startdate: '开始日期', updatedat: '更新时间', url: '网址', variety: '品种',
};

const translations = { entity, relationship, property };

export type OntologyTermKind = keyof typeof translations;

export function ontologyTermTranslation(name: string, kind: OntologyTermKind): string | undefined {
  const key = name.toLowerCase().replace(/[\s_-]+/g, '');
  const dictionary = translations[kind];
  if (Object.hasOwn(dictionary, key)) return dictionary[key];

  if (kind === 'property' && /id$/i.test(name)) {
    const stem = key.slice(0, -2);
    const prefix = Object.hasOwn(entity, stem) ? entity[stem]
      : Object.hasOwn(property, stem) ? property[stem] : undefined;
    if (prefix) return `${prefix}编号`;
  }
}

export function ontologyLabel(name: string, kind: OntologyTermKind): string {
  const translation = ontologyTermTranslation(name, kind);
  return translation ? `${name}（${translation}）` : name;
}
