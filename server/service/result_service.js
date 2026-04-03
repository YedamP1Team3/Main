const resultMapper = require("../database/mappers/result_mapper.js");
const fs = require("fs");
const path = require("path");

//지원결과 리스트
const getSupportResultList = async (beneId) => {
  let list = await resultMapper.selectSupportResultList(beneId);
  return list || [];
};

const getSupportResultTempList = async (beneId) => {
  let list = await resultMapper.selectSupportResultTempList(beneId);
  return list || [];
};

const createSupportResult = async (newResult, files) => {
  const selectedPlansRaw = newResult?.selected_plans;
  const selected_plans = (() => {
    if (Array.isArray(selectedPlansRaw)) return selectedPlansRaw;
    if (!selectedPlansRaw) return [];
    try {
      return JSON.parse(selectedPlansRaw);
    } catch {
      return [];
    }
  })();

  const { manager_id, bene_id, result_title, result_content, progress_state } =
    newResult;

  // 1. 결과서 본문 데이터 준비 (첫 번째 계획서를 대표 ID로 사용)
  const mainPlanId =
    selected_plans.length > 0 ? selected_plans[0].plan_id : null;
  const insertData = [
    mainPlanId,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state || "대기",
  ];

  // 2. 결과서 본문 저장
  const result = await resultMapper.createSupportResult(insertData);
  const newResultId = result.insertId;

  // 3. 매핑 테이블 저장 (선택된 계획서가 있을 때만)
  if (newResultId && selected_plans.length > 0) {
    const mappingValues = selected_plans.map((plan) => [
      newResultId,
      plan.plan_id,
    ]);
    await resultMapper.insertMapping(mappingValues);
  }

  if (newResultId && files && files.length > 0) {
    for (const file of files) {
      const fileData = [
        newResultId,
        null,
        file.originalname,
        file.filename,
        file.size,
      ];
      await resultMapper.insertResultAttachment(fileData);
    }
  }

  return { success: true, insertId: newResultId };
};

const createTempResult = async (newResult, files) => {
  const selectedPlansRaw = newResult?.selected_plans;
  const selected_plans = (() => {
    if (Array.isArray(selectedPlansRaw)) return selectedPlansRaw;
    if (!selectedPlansRaw) return [];
    try {
      return JSON.parse(selectedPlansRaw);
    } catch {
      return [];
    }
  })();

  const { manager_id, bene_id, result_title, result_content } = newResult;

  // 1. 본문 데이터 준비
  const mainPlanId = selected_plans?.[0]?.plan_id || null;
  const insertData = [
    mainPlanId,
    manager_id,
    bene_id,
    result_title,
    result_content,
    "임시",
  ];

  try {
    // 2. 본문 저장
    const result = await resultMapper.createTempResult(insertData);
    const newResultId = result.insertId;

    // 3. 매핑 저장 (plan_id들만 추출해서 전달)
    if (newResultId && selected_plans?.length > 0) {
      const planIds = selected_plans.map((p) => p.plan_id); // [71, 72...] 형태
      await resultMapper.insertTempMapping(newResultId, planIds);
    }

    if (newResultId && files && files.length > 0) {
      for (const file of files) {
        const fileData = [
          null,
          newResultId,
          file.originalname,
          file.filename,
          file.size,
        ];
        await resultMapper.insertResultAttachment(fileData);
      }
    }

    return { success: true, insertId: newResultId };
  } catch (err) {
    console.error("임시저장 서비스 에러:", err);
    throw err;
  }
};

const getApprovedPlanList = async (beneId) => {
  let list = await resultMapper.selectApprovedPlanList(beneId);
  return list || [];
};

const getSupportDetail = async (resultID) => {
  let resultInfo = await resultMapper.selectSupportResultDetail(resultID);
  let planList = await resultMapper.selectLinkedPlanList(resultID);
  let files = await resultMapper.selectResultAttachments(resultID);
  // 3. 결과서 정보가 있을 때만 목록을 합쳐서 반환
  if (resultInfo) {
    // resultInfo 객체 안에 'selected_plans'라는 이름으로 목록을 쏙 넣어줍니다.
    resultInfo.selected_plans = planList || [];
    resultInfo.files = files || [];
    return resultInfo;
  }
  return {};
};

const removeSupportResult = async (resultId) => {
  try {
    const rows = await resultMapper.selectResultAttachments(resultId);
    await resultMapper.deleteResultAttachments(resultId);

    const uploadDir = "d:/uploads";
    for (const row of rows || []) {
      const targetPath = path.join(uploadDir, row.file_name);
      try {
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }

  let result = await resultMapper.removeSupportResult(resultId);
  let resObj = {
    status: result.affectedRows > 0 ? "success" : "fail",
    result_no: resultId,
  };
  return resObj;
};

const removeTempResult = async (resultId) => {
  try {
    const rows = await resultMapper.selectDraftResultAttachments(resultId);
    await resultMapper.deleteDraftResultAttachments(resultId);

    const uploadDir = "d:/uploads";
    for (const row of rows || []) {
      const targetPath = path.join(uploadDir, row.file_name);
      try {
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }

  let result = await resultMapper.removeTempResult(resultId);
  let resObj = {
    status: result.affectedRows > 0 ? "success" : "fail",
    result_no: resultId,
  };
  return resObj;
};

const addSupportResultFiles = async (resultId, files) => {
  if (!resultId) {
    return { status: "fail" };
  }
  if (!files || files.length === 0) {
    return { status: "fail" };
  }

  for (const file of files) {
    const fileData = [
      resultId,
      null,
      file.originalname,
      file.filename,
      file.size,
    ];
    await resultMapper.insertResultAttachment(fileData);
  }

  return { status: "success" };
};

const addTempResultFiles = async (resultDraftId, files) => {
  if (!resultDraftId) {
    return { status: "fail" };
  }
  if (!files || files.length === 0) {
    return { status: "fail" };
  }

  for (const file of files) {
    const fileData = [
      null,
      resultDraftId,
      file.originalname,
      file.filename,
      file.size,
    ];
    await resultMapper.insertResultAttachment(fileData);
  }

  return { status: "success" };
};

const removeSupportResultFile = async (resultId, fileId) => {
  const parsedResultId = Number(resultId);
  const parsedFileId = Number(fileId);
  if (!Number.isFinite(parsedResultId) || !Number.isFinite(parsedFileId)) {
    return { status: "fail" };
  }

  const fileRow = await resultMapper.selectResultAttachment(
    parsedResultId,
    parsedFileId,
  );
  if (!fileRow) {
    return { status: "fail" };
  }

  const result = await resultMapper.deleteResultAttachment(
    parsedResultId,
    parsedFileId,
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

const removeTempResultFile = async (resultDraftId, fileId) => {
  const parsedDraftId = Number(resultDraftId);
  const parsedFileId = Number(fileId);
  if (!Number.isFinite(parsedDraftId) || !Number.isFinite(parsedFileId)) {
    return { status: "fail" };
  }

  const fileRow = await resultMapper.selectDraftResultAttachment(
    parsedDraftId,
    parsedFileId,
  );
  if (!fileRow) {
    return { status: "fail" };
  }

  const result = await resultMapper.deleteDraftResultAttachment(
    parsedDraftId,
    parsedFileId,
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

const applySupportResult = async (tempId, resultData, planIds = []) => {
  try {
    const { manager_id, bene_id, result_title, result_content } = resultData;

    // 1. 정식 지원결과서 생성을 위한 데이터 배열 (첫 번째 계획서를 대표 ID로 설정)
    const mainPlanId = planIds.length > 0 ? planIds[0] : null;
    const insertData = [
      mainPlanId,
      manager_id,
      bene_id,
      result_title,
      result_content,
      "대기", 
    ];

    // 2. 정식 지원결과서 본문 생성 (support_result 테이블)
    const createResult = await resultMapper.createSupportResult(insertData);
    const newResultId = createResult.insertId;

    // 3. 생성이 성공했다면 후속 작업 진행
    if (newResultId) {
      // 3-1. 정식 매핑 테이블 저장 (result_plan_mapping)
      if (planIds.length > 0) {
        const mappingValues = planIds.map((planId) => [newResultId, planId]);
        await resultMapper.insertMapping(mappingValues);
      }

      await resultMapper.moveDraftResultAttachmentsToResult(newResultId, tempId);

      // 3-2. 기존 임시 저장본 삭제 (result_draft)
      // 매핑 테이블(result_draft_mapping)은 DB의 ON DELETE CASCADE 설정에 따라 자동 삭제되거나, 
      // 아래처럼 명시적으로 삭제 함수를 호출해줍니다.
      await resultMapper.removeTempMapping(tempId); // 임시 매핑 먼저 삭제
      await resultMapper.removeTempResult(tempId);   // 임시 본문 삭제
    }

    return {
      success: true,
      status: "success",
      message: "승인 신청 및 임시 데이터 삭제가 완료되었습니다.",
    };
  } catch (err) {
    console.error("승인 처리 서비스 에러:", err);
    return {
      success: false,
      status: "error",
      message: "승인 처리 중 오류가 발생했습니다.",
    };
  }
};

const updateTempSupportResult = async (resultId, resultData, planIds) => {
  try {
    await resultMapper.updateTempSupportResult(resultId, resultData);
    await resultMapper.removeTempMapping(resultId);

    if (planIds && planIds.length > 0) {
      await resultMapper.insertTempMapping(resultId, planIds);
    }
    return { status: "success", message: "승인요청이 완료되었습니다" };
  } catch (err) {
    console.error("승인처리중 서비스 에러", err);
    return { status: "fail", message: "승인 처리 중 오류가 발생했습니다." };
  }
};

const getSupportTempDetail = async (resultId) => {
  try {
    // 1. 임시 테이블에서 본문 데이터 가져오기
    let resultInfo = await resultMapper.selectSupportResultTempDetail(resultId);

    if (resultInfo) {
      // 2. [수정] 매핑 테이블(result_draft_mapping)에서 연결된 계획서 목록 가져오기
      let planList = await resultMapper.selectLinkedTempList(resultId);
      let files = await resultMapper.selectDraftResultAttachments(resultId);
      
      // 화면에서 사용할 수 있도록 selected_plans에 넣어줌
      resultInfo.selected_plans = planList || [];
      resultInfo.files = files || [];
      return resultInfo;
    }
    return {};
  } catch (err) {
    console.error("임시저장 상세조회 서비스 에러:", err);
    throw err;
  }
};

const resubmitSupportResult = async (resultId, resultData) => {
  try {
    // 라우터에서 넘어온 target 데이터 분리
    const { result_title, result_content, planIds } = resultData;
    await resultMapper.resubmitSupportResult(resultId, {
      title: result_title,
      content: result_content
    });

    // 2. 기존 매핑 데이터 전체 삭제 (중요: 지적하신 수정 로직 반영)
    await resultMapper.removeMapping(resultId);

    // 3. 새로운 매핑 데이터 다시 삽입
    if (planIds && planIds.length > 0) {
      // mappingValues: [[resultId, planId1], [resultId, planId2], ...]
      const mappingValues = planIds.map((id) => [resultId, id]);
      await resultMapper.insertMapping(mappingValues);
    }

    return { 
      success: true, 
      status: "success", 
      message: "수정 및 재승인 요청이 완료되었습니다." 
    };
  } catch (err) {
    console.error("재승인 처리 중 서비스 에러:", err);
    return { success: false, status: "error", message: "처리 중 오류가 발생했습니다." };
  }
};

const rejectSupportResult = async (resultId, resultData) => {
  try {
    // 1. 데이터 구조 분해 할당
    const { result_title, result_content, planIds } = resultData;

    // 2. 본문 수정 (매퍼에 '값'들을 순서대로 전달)
    // 상태는 '반려/수정중'으로 유지하거나 업데이트합니다.
    await resultMapper.rejectSupportResult(
      result_title, 
      result_content, 
      resultId
    );

    // 3. 기존 매핑 데이터 전체 삭제 (지적하신 핵심 로직)
    await resultMapper.removeMapping(resultId);

    // 4. 새로운 매핑 데이터 다시 삽입
    if (planIds && planIds.length > 0) {
      // MariaDB bulk insert를 위해 [ [resultId, planId], [...] ] 형식으로 변환
      const mappingValues = planIds.map((id) => [resultId, id]);
      await resultMapper.insertMapping(mappingValues);
    }

    return { 
      status: "success", 
      message: "수정 내용이 임시 저장되었습니다." 
    };
  } catch (err) {
    console.error("임시 저장 처리 중 서비스 에러:", err);
    throw err; // 라우터에서 catch하도록 던집니다.
  }
};

module.exports = {
  getSupportResultList,
  getSupportResultTempList,
  createSupportResult,
  createTempResult,
  getApprovedPlanList,
  getSupportDetail,
  removeSupportResult,
  applySupportResult,
  updateTempSupportResult,
  getSupportTempDetail,
  removeTempResult,
  addSupportResultFiles,
  addTempResultFiles,
  removeSupportResultFile,
  removeTempResultFile,
  resubmitSupportResult,
  rejectSupportResult
};
