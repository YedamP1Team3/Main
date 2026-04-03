const userMapper = require("../database/mappers/user_mapper.js");
const fs = require("fs");
const path = require("path");

//전체 회원조회
const findAll = async () => {
  let list = await userMapper.selectAllUser();
  return list;
};

//지원자 조회
const getBeneficiariesNames = async (managerId) => {
  const list = await userMapper.selectBeneficiariesNames(managerId);
  return list || [];
};
//지원제 상세조회
const getBeneficiariesDetail = async (id) => {
  const detail = await userMapper.selectBeneficiariesDetail(id);
  return detail || null;
};
//지원자의 지원계획서
const getSupportPlanList = async (beneId) => {
  let list = await userMapper.selectSupportPlanList(beneId);
  return list || [];
};
//지원계획서 생성(파일첨부)
const createSupportPlan = async (supportPlan, files) => {
  const {
    priority_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  } = supportPlan;
  const insertDate = [
    priority_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  ];

  try {
    const result = await userMapper.createSupportPlan(insertDate);
    const planId = result?.insertId;
    if (planId && files && files.length > 0) {
      for (const file of files) {
        const fileData = [
          planId,
          null, // plan_draft_id
          file.originalname, // 원본 파일명
          file.filename, // 서버에 저장된 실제 파일명
          file.size, // 파일 크기
        ];

        // 매퍼 호출 (이 안에서 파일을 직접 '쓰는' 로직이 없는지 확인하세요)
        await userMapper.insertAttachment(fileData);
      }
    }

    // 4. 최종 결과 반환
    return {
      status: planId ? "success" : "fail",
      plan_id: planId, // user_no 대신 의미가 명확한 plan_id 사용 권장
    };
  } catch (error) {
    console.error("지원계획서 생성 서비스 에러:", error);
    throw error; // 에러를 던져서 라우터에서 catch할 수 있게 함
  }
};
//지원계획서 임시 생성(파일첨부)
const createTempPlan = async (supportPlan, files) => {
  const {
    plan_draft_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  } = supportPlan;
  let insertDate = [
    plan_draft_id ?? null,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  ];

  try {
    const result = await userMapper.createTempPlan(insertDate);
    const planDraftId = result?.insertId;

    if (planDraftId && files && files.length > 0) {
      for (const file of files) {
        const fileData = [
          null, // plan_id
          planDraftId, // plan_draft_id
          file.originalname,
          file.filename,
          file.size,
        ];
        await userMapper.insertAttachment(fileData);
      }
    }

    return {
      status: planDraftId ? "success" : "fail",
      plan_draft_id: planDraftId,
    };
  } catch (error) {
    console.error("지원계획서 임시생성 서비스 에러:", error);
    throw error;
  }
};

//지원계획서 임시 조회
const getSupportPlanTempList = async (beneId) => {
  let list = await userMapper.selectSupportPlanTempList(beneId);
  return list || [];
};
//지원계획서상세조회
const getSupportPlanDetail = async (planID) => {
  let planResult = await userMapper.selectSupportPlanDetail(planID);
  let fileList = await userMapper.selectAttachments(planID);
  return {
    plan: planResult || {},
    files: fileList || [],
  };
};
//임시지원계획서조회
const getTempPlanDetail = async (planID) => {
  const plan = await userMapper.selectTempPlanDetail(planID);
  const files = await userMapper.selectDraftAttachments(planID);
  return {
    ...(plan || {}),
    files: files || [],
  };
};
//지원계획서삭제
const removeSupportPlan = async (planId) => {
  try {
    await userMapper.deleteAttachments(planId);
    const result = await userMapper.removeSupportPlan(planId);
    if (result && result.affectedRows > 0) {
      return { status: "success" };
    }
    return { status: "fail" };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
//지원계획서임시 삭제
const removeTempPlan = async (planDraftId) => {
  try {
    await userMapper.deleteDraftAttachments(planDraftId);
    const result = await userMapper.removeTempPlan(planDraftId);
    if (result && result.affectedRows > 0) {
      return { status: "success" };
    }
    return { status: "fail" };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
//지원계획서승인신청
const resubmitSupportPlan = async (planId, planDate) => {
  let result = await userMapper.resubmitSupportPlan(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      ...planDate,
    },
  };
  return resObj;
};
//지원계획서승인신청
const rejectSupportPlan = async (planId, planDate) => {
  let result = await userMapper.rejectSupportPlan(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      ...planDate,
    },
  };
  return resObj;
};
//지원계획서업데이트(임시)
const updateTempPlan = async (planDraftId, planDate) => {
  let result = await userMapper.updateTempPlan(planDraftId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planDraftId,
      ...planDate,
    },
  };
  return resObj;
};
//지원계획서 임시승인처리
const approveTempPlan = async (target) => {
  try {
    // 1. 객체 구조 분해 할당 (target 객체에서 필요한 값들을 추출)
    const {
      plan_draft_id, // 삭제를 위해 필요
      priority_id, // 생성을 위해 필요
      manager_id,
      bene_id,
      plan_objective,
      plan_content,
      progress_state,
    } = target;
    const insertData = [
      priority_id,
      manager_id,
      bene_id,
      plan_objective,
      plan_content,
      progress_state,
    ];
    // 3. 정식 지원계획서 생성 수행
    const createResult = await userMapper.createSupportPlan(insertData);
    const createdPlanId = createResult?.insertId;

    if (createdPlanId && plan_draft_id) {
      await userMapper.moveDraftAttachmentsToPlan(createdPlanId, plan_draft_id);
    }

    // 4. 생성이 성공(affectedRows > 0)했다면, 임시 저장본 삭제 수행
    if (createResult && createResult.affectedRows > 0) {
      if (plan_draft_id) {
        await userMapper.deleteDraftAttachments(plan_draft_id);
        await userMapper.removeTempPlan(plan_draft_id);
      }
    }

    return {
      status: "success",
      message: "승인 신청 및 임시 데이터 삭제가 완료되었습니다.",
    };
  } catch (err) {
    console.error("승인 처리 서비스 에러:", err);
    // 에러 발생 시 컨트롤러(라우터)로 에러를 던지거나 에러 객체 반환
    return {
      status: "error",
      message: "승인 처리 중 오류가 발생했습니다.",
    };
  }
};
//지원계획서 임시 파일 저장
const addTempPlanFiles = async (planDraftId, files) => {
  if (!planDraftId) {
    return { status: "fail" };
  }
  if (!files || files.length === 0) {
    return { status: "fail" };
  }

  for (const file of files) {
    const fileData = [
      null,
      planDraftId,
      file.originalname,
      file.filename,
      file.size,
    ];
    await userMapper.insertAttachment(fileData);
  }

  return { status: "success" };
};
//지원계획서 파일 저장
const addSupportPlanFiles = async (planId, files) => {
  if (!planId) {
    return { status: "fail" };
  }
  if (!files || files.length === 0) {
    return { status: "fail" };
  }

  for (const file of files) {
    const fileData = [
      planId,
      null,
      file.originalname,
      file.filename,
      file.size,
    ];
    await userMapper.insertAttachment(fileData);
  }

  return { status: "success" };
};
//지원계획서 임시 파일 삭제
const removeTempPlanFile = async (planDraftId, fileId) => {
  const draftId = Number(planDraftId);
  const attachmentId = Number(fileId);
  if (!Number.isFinite(draftId) || !Number.isFinite(attachmentId)) {
    return { status: "fail" };
  }

  const fileRow = await userMapper.selectDraftAttachment(draftId, attachmentId);
  if (!fileRow) {
    return { status: "fail" };
  }

  const result = await userMapper.deleteDraftAttachment(draftId, attachmentId);
  if (!result || result.affectedRows <= 0) {
    return { status: "fail" };
  }

  const uploadDir = "d:/uploads";
  const targetPath = path.join(uploadDir, fileRow.file_name);
  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  } catch (err) {
    console.error(err);
  }

  return { status: "success" };
};
//지원계획서 파일 삭제
const removeSupportPlanFile = async (planId, fileId) => {
  const supportPlanId = Number(planId);
  const attachmentId = Number(fileId);
  if (!Number.isFinite(supportPlanId) || !Number.isFinite(attachmentId)) {
    return { status: "fail" };
  }

  const fileRow = await userMapper.selectPlanAttachment(
    supportPlanId,
    attachmentId,
  );
  if (!fileRow) {
    return { status: "fail" };
  }

  const result = await userMapper.deletePlanAttachment(
    supportPlanId,
    attachmentId,
  );
  if (!result || result.affectedRows <= 0) {
    return { status: "fail" };
  }

  const uploadDir = "d:/uploads";
  const targetPath = path.join(uploadDir, fileRow.file_name);
  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  } catch (err) {
    console.error(err);
  }

  return { status: "success" };
};

module.exports = {
  findAll,
  getBeneficiariesNames,
  getBeneficiariesDetail,
  getSupportPlanList,
  createSupportPlan,
  createTempPlan,
  getSupportPlanTempList,
  getSupportPlanDetail,
  getTempPlanDetail,
  removeSupportPlan,
  removeTempPlan,
  resubmitSupportPlan,
  rejectSupportPlan,
  updateTempPlan,
  approveTempPlan,
  addTempPlanFiles,
  removeTempPlanFile,
  addSupportPlanFiles,
  removeSupportPlanFile,
};
