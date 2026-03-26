const resultMapper = require("../database/mappers/result_mapper.js");

//지원결과 리스트
const resultListService = async (beneId) => {
  let list = await resultMapper.resultListMapper(beneId);
  return list || [];
};

const saveResultListService = async (beneId) => {
  let list = await resultMapper.saveResultListMapper(beneId);
  return list || [];
};

const newResultService = async (newResult) => {
  const {
    selected_plans,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state,
  } = newResult;

  const groupId = `${Date.now()}`;
  let lastInsertId = 0;

  for (let plan of selected_plans) {
    let insertDate = [
      plan.plan_id,
      manager_id,
      bene_id,
      result_title,
      result_content,
      progress_state || "대기",
      groupId,
    ];

    let result = await resultMapper.newResultMapper(insertDate);
    lastInsertId = result.insertId;
  }

  let resObj = {
    status: lastInsertId > 0 ? "success" : "fail",
    user_no: lastInsertId,
    group_id: groupId,
  };
  return resObj;
};

const supportListService = async (beneId) => {
  let list = await resultMapper.supportListMapper(beneId);
  return list || [];
};

module.exports = {
  resultListService,
  saveResultListService,
  newResultService,
  supportListService,
};
