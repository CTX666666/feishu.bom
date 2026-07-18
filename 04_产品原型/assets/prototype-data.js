(function (root, factory) {
  var data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  root.BOM_DATA = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var labels = {
    purchase_order_confirmed: "采购确认",
    supplier_asn: "供应商ASN确认",
    production_completed: "生产完工",
    quality_released: "质检放行",
    inventory_reserved: "库存预留",
    factory_outbound: "厂区出库已确认",
    inter_factory_transfer: "厂间调拨已确认",
    port_transfer: "进港转运已确认",
    packed: "装箱完成",
    loaded_on_board: "已装船",
    arrived_port: "到达目的港",
    customs_draft: "报关草单数量冲突",
    customs_declared: "正式申报已确认",
    customs_released: "海关放行已确认",
    signed_delivery: "项目现场已签收",
    installation_consumed: "安装领用完成",
    loading_plan: "计划装船待确认"
  };

  var statusLabels = {
    customs_quantity_conflict: "报关数量冲突",
    loaded_on_board: "已装船",
    packed_not_declared: "已装箱，未匹配申报证据",
    signed_delivery: "项目现场已签收",
    installation_consumed: "安装领用完成",
    silent_exception: "沉默异常"
  };

  var caseLabels = { open: "待处理", acknowledged: "已确认", closed: "已关闭" };

  var materials = [
    {
      id: "BL-1001", code: "MAT-ECAB-001", name: "电控柜", module: "机器人工作站3", qty: "4 set", need: "2026-08-20 08:00",
      status: "customs_quantity_conflict", risk: "high", remaining: 18, latest: "2026-08-10 10:00", transport: 216, actionLead: 10, buffer: 12, role: "关务负责人",
      caseId: "CASE-1001", caseStatus: "open", caseVersion: 7, escalation: "关务负责人 > 项目经理", terminal: false,
      action: "补充申报并要求报关行回传更正回执", summary: "商业发票和装箱单数量为4，进口报关草单数量为3。系统保留冲突并等待更正回执。",
      events: [
        ["2026-07-20 10:00", "purchase_order_confirmed", "采购订单确认4 set。", "confirmed"],
        ["2026-07-27 17:10", "production_completed", "广州工厂完工4 set。", "confirmed"],
        ["2026-07-28 08:40", "quality_released", "质检放行4 set。", "confirmed"],
        ["2026-07-28 09:30", "factory_outbound", "广州工厂出库4 set。", "confirmed"],
        ["2026-07-28 14:20", "inter_factory_transfer", "广州工厂到苏州集成工厂，跨厂调拨4 set。", "confirmed"],
        ["2026-07-29 08:20", "port_transfer", "苏州集成工厂到上海港，进港4 set。", "confirmed"],
        ["2026-07-29 16:10", "packed", "PKG-A17装入CONT-7781，数量4 set。", "confirmed"],
        ["2026-08-02 23:30", "loaded_on_board", "提单确认CONT-7781已装船，数量4 set。", "confirmed"],
        ["2026-08-08 07:40", "arrived_port", "承运人事件确认集装箱到达汉堡港。", "confirmed"],
        ["2026-08-08 11:20", "customs_draft", "进口报关草单数量3，与发票及装箱单数量4不一致。", "conflict"]
      ],
      evidence: [
        ["EVD-WMS-1001", "WMS出库记录", "wms_outbound_20260728.xlsx", "row 18", "MAT-ECAB-001 outbound qty 4 SET", "0.99", "high", "SRC-WMS-EUA-0728"],
        ["EVD-PL-1001", "最终装箱单", "packing_list_EU-A.pdf", "page 2 line 16", "PKG-A17 Control Cabinet 4 SET in CONT-7781", "0.96", "high", "SRC-PL-EUA-001"],
        ["EVD-INV-1001", "商业发票", "invoice_EU-A.pdf", "page 1 line 12", "Electrical cabinet quantity 4 SET", "0.98", "high", "SRC-INV-EUA-001"],
        ["EVD-BL-1001", "提单", "bill_of_lading_CONT-7781.pdf", "page 1 line 22", "PKG-A17 Control Cabinet 4 SET loaded on board in CONT-7781", "0.99", "high", "SRC-BL-CONT-7781"],
        ["EVD-CAR-1001", "承运人事件", "carrier_status_CONT-7781.json", "event 28", "CONT-7781 arrived at Hamburg Port", "0.98", "high", "SRC-CAR-CONT-7781"],
        ["EVD-CD-1001", "报关草单", "customs_draft_EU-A.pdf", "page 1 table 3", "Electrical cabinet qty 3 SET", "0.93", "medium", "SRC-CD-EUA-001"]
      ]
    },
    {
      id: "BL-1002", code: "MAT-SERVO-014", name: "伺服驱动器", module: "机器人工作站3", qty: "8 pcs", need: "2026-08-18 18:00",
      status: "loaded_on_board", risk: "medium", remaining: 68, latest: "2026-08-12 12:00", transport: 120, actionLead: 6, buffer: 24, role: "项目计划员",
      caseId: "CASE-1002", caseStatus: "acknowledged", caseVersion: 3, escalation: "项目计划员 > 项目经理", terminal: false,
      action: "继续监控ETA并确认末端运输预约", summary: "提单已确认8件伺服驱动器装船，当前等待后续到港和末端运输事件。",
      events: [
        ["2026-07-25 11:00", "supplier_asn", "供应商ASN确认8 pcs。", "confirmed"],
        ["2026-07-27 09:20", "inventory_reserved", "广州工厂预留8 pcs。", "confirmed"],
        ["2026-07-29 16:20", "packed", "分装为PKG-A18-1与PKG-A18-2，各4 pcs。", "confirmed"],
        ["2026-08-02 23:30", "loaded_on_board", "提单确认两箱共8 pcs随CONT-7781装船。", "confirmed"]
      ],
      evidence: [
        ["EVD-PL-1002-A", "最终装箱单", "packing_list_EU-A.pdf", "page 2 line 18", "PKG-A18-1 Servo Drive 4 PCS in CONT-7781", "0.97", "high", "SRC-PL-EUA-001"],
        ["EVD-PL-1002-B", "最终装箱单", "packing_list_EU-A.pdf", "page 2 line 19", "PKG-A18-2 Servo Drive 4 PCS in CONT-7781", "0.97", "high", "SRC-PL-EUA-001"],
        ["EVD-BL-1002", "提单", "bill_of_lading_CONT-7781.pdf", "page 1 line 24", "PKG-A18-1 and PKG-A18-2 Servo Drive total 8 PCS loaded on board", "0.98", "high", "SRC-BL-CONT-7781"]
      ]
    },
    {
      id: "BL-2001", code: "MAT-GUN-032", name: "轻量模块化焊枪", module: "点焊工作站1", qty: "2 pcs", need: "2026-08-22 09:00",
      status: "packed_not_declared", risk: "medium", remaining: 50, latest: "2026-08-11 18:00", transport: 216, actionLead: 15, buffer: 24, role: "关务负责人",
      caseId: "CASE-2001", caseStatus: "open", caseVersion: 2, escalation: "关务负责人 > 项目经理", terminal: false,
      action: "确认报关资料是否缺少品名或HS编码", summary: "焊枪已经调拨到上海港并完成装箱，尚未匹配正式申报证据。",
      events: [
        ["2026-07-31 16:30", "production_completed", "广州工厂完工2 pcs。", "confirmed"],
        ["2026-08-01 07:40", "quality_released", "质检放行2 pcs。", "confirmed"],
        ["2026-08-01 08:20", "inter_factory_transfer", "广州工厂到苏州集成工厂，跨厂调拨2 pcs。", "confirmed"],
        ["2026-08-01 15:10", "port_transfer", "苏州集成工厂到上海港，进港2 pcs。", "confirmed"],
        ["2026-08-02 15:40", "packed", "PKG-A19装箱完成，数量2 pcs。", "confirmed"]
      ],
      evidence: [
        ["EVD-TR-2001-A", "跨厂调拨单", "transfer_order_019.pdf", "line 6", "PKG-A19 transferred from Guangzhou Plant to Suzhou Integration Plant", "0.96", "high", "SRC-TR-EUA-019"],
        ["EVD-PL-2001", "最终装箱单", "packing_list_EU-A.pdf", "page 3 line 9", "PKG-A19 FlexGun 2 PCS in CONT-7782", "0.95", "high", "SRC-PL-EUA-001"]
      ]
    },
    {
      id: "BL-3001", code: "MAT-BASE-009", name: "机器人底座", module: "总装夹具区", qty: "6 pcs", need: "2026-08-16 12:00",
      status: "installation_consumed", risk: "low", remaining: 116, latest: "2026-08-14 12:00", transport: 24, actionLead: 8, buffer: 16, role: "现场物流负责人",
      caseId: "CASE-3001", caseStatus: "closed", caseVersion: 11, escalation: "现场物流负责人 > 项目经理", terminal: true,
      closed: "2026-08-09 10:15", closeReason: "物料已签收并领用安装", closureEvidence: "EVD-INSTALL-3001",
      action: "归档签收与安装领用证据", summary: "海关申报更正、放行、现场签收和安装领用证据完整，案例已经关闭。",
      events: [
        ["2026-08-05 10:20", "customs_declared", "初次申报5 pcs，随后被更正记录替代。", "conflict"],
        ["2026-08-05 12:10", "customs_declared", "更正申报为6 pcs并指向前序记录。", "confirmed"],
        ["2026-08-06 13:30", "customs_released", "海关放行证据已匹配。", "confirmed"],
        ["2026-08-08 16:20", "signed_delivery", "欧洲项目A现场签收6 pcs。", "confirmed"],
        ["2026-08-09 10:00", "installation_consumed", "总装夹具区安装领用6 pcs。", "confirmed"]
      ],
      evidence: [
        ["EVD-CUS-3001-V1", "原申报回执", "customs_declaration_041_v1.pdf", "line 5", "Robot base quantity 5 PCS declared", "0.99", "high", "SRC-CUS-041-V1"],
        ["EVD-CUS-3001-V2", "更正申报回执", "customs_declaration_041_v2.pdf", "line 5", "Correction of declaration 041 Robot base quantity 6 PCS", "0.99", "high", "SRC-CUS-041-V2"],
        ["EVD-POD-3001", "签收回单", "pod_006.pdf", "signature block", "Robot base quantity 6 PCS received at project site", "0.98", "high", "SRC-POD-006"],
        ["EVD-INSTALL-3001", "安装领用记录", "installation_consumption_006.json", "record 16", "Robot base quantity 6 PCS issued to General Assembly Fixture Area", "0.99", "high", "SRC-MES-INSTALL-006"]
      ]
    },
    {
      id: "BL-4001", code: "MAT-CABLE-120", name: "主控线束", module: "电气控制系统", qty: "12 set", need: "2026-08-17 10:00",
      status: "silent_exception", risk: "high", remaining: 4, latest: "2026-08-09 20:00", transport: 144, actionLead: 14, buffer: 24, role: "货代接口人",
      caseId: "CASE-4001", caseStatus: "open", caseVersion: 5, escalation: "货代接口人 > 项目经理 > 供应链负责人", terminal: false,
      action: "联系货代确认是否已实际装船并索取提单", summary: "计划装船时间已超过37小时，上游已就绪且数据源健康，仍未收到提单或承运人实际事件，规则判定为业务沉默异常。",
      events: [
        ["2026-07-21 09:00", "purchase_order_confirmed", "采购订单确认12 set。", "confirmed"],
        ["2026-08-01 15:00", "inventory_reserved", "广州工厂库存预留12 set。", "confirmed"],
        ["2026-08-08 09:00", "loading_plan", "邮件计划PKG-C09于该时点装船；截至快照仍无实际回执。", "pending"]
      ],
      evidence: [
        ["EVD-MAIL-4001", "货代邮件", "forwarder_update_20260803.eml", "paragraph 2", "MAT-CABLE-120 12 SET packed as PKG-C09 in CONT-7784 at Shanghai Port and planned loading to Hamburg at 2026-08-08 09:00 CST", "0.96", "medium", "SRC-MAIL-117"]
      ]
    }
  ];

  return {
    labels: labels,
    statusLabels: statusLabels,
    caseLabels: caseLabels,
    materials: materials
  };
});
