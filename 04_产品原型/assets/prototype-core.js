(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BOMCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function simulateDelay(input) {
    var baselineHours = Number(input.remainingHours);
    var delayHours = Number(input.delayHours);
    return {
      baselineHours: baselineHours,
      scenarioHours: baselineHours - delayHours,
      delayHours: delayHours,
      persisted: false
    };
  }

  function extractQuantity(text) {
    var value = String(text || "");
    var direct = value.match(/(?:quantity|qty)\s+(\d+)/i);
    if (direct) return Number(direct[1]);
    var unit = value.match(/\b(\d+)\s*(?:SET|PCS)\b/i);
    return unit ? Number(unit[1]) : null;
  }

  function summarizeQuantityConflict(evidence) {
    var supportedTypes = ["最终装箱单", "商业发票", "报关草单"];
    var quantities = (evidence || [])
      .filter(function (item) { return supportedTypes.indexOf(item[1]) >= 0; })
      .map(function (item) { return extractQuantity(item[4]); })
      .filter(function (value) { return Number.isFinite(value); });
    return {
      quantities: quantities,
      hasConflict: new Set(quantities).size > 1
    };
  }

  function validateCloseAction(input) {
    if (input.actorRole !== "customs_owner" && input.actorRole !== "project_manager") {
      return { allowed: false, code: "FORBIDDEN" };
    }
    if (Number(input.expectedVersion) !== Number(input.currentVersion)) {
      return { allowed: false, code: "STALE_CASE" };
    }
    if (!String(input.reason || "").trim()) {
      return { allowed: false, code: "REASON_REQUIRED" };
    }
    if (!Array.isArray(input.evidenceIds) || input.evidenceIds.length === 0) {
      return { allowed: false, code: "EVIDENCE_REQUIRED" };
    }
    return { allowed: true, code: "READY" };
  }

  function createActionReceipt(input) {
    return Object.freeze({
      source: "browser_demo",
      asOf: "2026-08-09T16:00:00+02:00",
      requestId: input.requestId,
      caseVersion: Number(input.caseVersion),
      ruleVersion: "WINDOW-V2",
      simulated: true,
      persisted: false,
      auditEventId: input.auditEventId
    });
  }

  function evaluateCallback(mode, firstReceipt) {
    if (mode === "invalid_signature") {
      return { accepted: false, stage: "gateway", code: "INVALID_SIGNATURE" };
    }
    if (mode === "expired_event") {
      return { accepted: false, stage: "replay_window", code: "EVENT_EXPIRED" };
    }
    if (mode === "duplicate_event") {
      return {
        accepted: true,
        duplicate: true,
        persisted: false,
        receipt: firstReceipt
      };
    }
    return { accepted: true, duplicate: false, persisted: false, simulated: true };
  }

  return {
    simulateDelay: simulateDelay,
    summarizeQuantityConflict: summarizeQuantityConflict,
    validateCloseAction: validateCloseAction,
    createActionReceipt: createActionReceipt,
    evaluateCallback: evaluateCallback
  };
});
