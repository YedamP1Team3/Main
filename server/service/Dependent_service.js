const dependentMapper = require("../database/mappers/Dependent_mapper.js");

const dependentService = {
  registerDependent: async (formData) => {
    // 관계 데이터 처리 (기타 선택 시 직접 입력값 사용)
    const finalRelation =
      formData.relation === "기타" ? formData.relationEtc : formData.relation;

    // 주소 합치기
    const fullAddress =
      `${formData.addressMain} ${formData.addressDetail}`.trim();

    // DB 컬럼 순서 매핑
    const dataArray = [
      "test_family_id", // FAMILY_ID
      null, // MANAGER_ID (기관담당자 - null 고정)
      formData.name,
      formData.disabilityType,
      formData.birthDate,
      formData.gender,
      finalRelation,
      formData.zipCode,
      fullAddress,
    ];

    return await dependentMapper.insertDependent(dataArray);
  },
};

module.exports = dependentService;
