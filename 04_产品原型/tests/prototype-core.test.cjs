const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('../assets/prototype-core.js');
const data = require('../assets/prototype-data.js');

test('72小时延误把18小时干预窗口推演为负54小时且不写回', () => {
  const result = core.simulateDelay({ remainingHours: 18, delayHours: 72 });

  assert.deepEqual(result, {
    baselineHours: 18,
    scenarioHours: -54,
    delayHours: 72,
    persisted: false,
  });
});

test('主案例保留4/4/3数量冲突并关联机器人工作站3', () => {
  const caseItem = data.materials.find((item) => item.id === 'BL-1001');
  const conflict = core.summarizeQuantityConflict(caseItem.evidence);

  assert.equal(caseItem.module, '机器人工作站3');
  assert.deepEqual(conflict.quantities, [4, 4, 3]);
  assert.equal(conflict.hasConflict, true);
});

test('关闭动作必须同时通过权限、版本、原因和证据校验', () => {
  const base = {
    actorRole: 'customs_owner',
    expectedVersion: 8,
    currentVersion: 8,
    reason: '报关数量已更正并完成复核',
    evidenceIds: ['EVD-DEMO-CORR-001'],
  };

  assert.deepEqual(core.validateCloseAction(base), { allowed: true, code: 'READY' });
  assert.equal(core.validateCloseAction({ ...base, actorRole: 'viewer' }).code, 'FORBIDDEN');
  assert.equal(core.validateCloseAction({ ...base, expectedVersion: 7 }).code, 'STALE_CASE');
  assert.equal(core.validateCloseAction({ ...base, reason: '' }).code, 'REASON_REQUIRED');
  assert.equal(core.validateCloseAction({ ...base, evidenceIds: [] }).code, 'EVIDENCE_REQUIRED');
});

test('飞书回调安全实验台阻断签名错误和过期事件', () => {
  assert.deepEqual(core.evaluateCallback('invalid_signature'), {
    accepted: false,
    stage: 'gateway',
    code: 'INVALID_SIGNATURE',
  });
  assert.deepEqual(core.evaluateCallback('expired_event'), {
    accepted: false,
    stage: 'replay_window',
    code: 'EVENT_EXPIRED',
  });
});

test('重复回调返回首次处理收据而不重复落账', () => {
  const firstReceipt = core.createActionReceipt({
    requestId: 'REQ-DEMO-0007',
    caseVersion: 8,
    auditEventId: 'AUD-DEMO-0007',
  });
  const duplicate = core.evaluateCallback('duplicate_event', firstReceipt);

  assert.equal(duplicate.accepted, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.persisted, false);
  assert.strictEqual(duplicate.receipt, firstReceipt);
});

test('动作收据明确标注浏览器模拟、未落账和版本元数据', () => {
  const receipt = core.createActionReceipt({
    requestId: 'REQ-DEMO-0008',
    caseVersion: 9,
    auditEventId: 'AUD-DEMO-0008',
  });

  assert.equal(receipt.source, 'browser_demo');
  assert.equal(receipt.simulated, true);
  assert.equal(receipt.persisted, false);
  assert.equal(receipt.ruleVersion, 'WINDOW-V2');
  assert.equal(receipt.requestId, 'REQ-DEMO-0008');
  assert.equal(receipt.caseVersion, 9);
  assert.equal(receipt.auditEventId, 'AUD-DEMO-0008');
});
