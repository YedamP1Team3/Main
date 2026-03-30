module.exports = {
  // 기존 등록용 매퍼
  mapForInsert: (data, familyId) => {
    const finalRelation =
      data.relation === "기타" ? data.relationEtc : data.relation;
    const fullAddress = `${data.address} ${data.detailAddress}`.trim();

    let formattedBirth = data.birth;
    if (data.birth && data.birth.length === 8) {
      formattedBirth = `${data.birth.substring(0, 4)}-${data.birth.substring(4, 6)}-${data.birth.substring(6, 8)}`;
    }

    return [
      familyId,
      data.name,
      data.disabilityType,
      formattedBirth,
      data.gender === "남성" ? "M" : "F",
      finalRelation,
      data.postcode, // Vue form의 변수명(postcode) 확인
      fullAddress,
    ];
  },

  // [수정 완료] 수정용 매퍼 (따로 분리)
  mapForUpdate: (data, beneId) => {
    const finalRelation =
      data.relation === "기타" ? data.relationEtc : data.relation;
    const fullAddress = `${data.address} ${data.detailAddress}`.trim();

    let formattedBirth = data.birth;
    if (data.birth && data.birth.length === 8) {
      formattedBirth = `${data.birth.substring(0, 4)}-${data.birth.substring(4, 6)}-${data.birth.substring(6, 8)}`;
    }

    // SQL UPDATE 문의 ? 순서와 일치해야 함:
    // SET bene_name=?, disability_type=?, birth_date=?, gender=?, relationship=?, zip_code=?, address=? WHERE bene_id=?
    return [
      data.name, // 1. bene_name
      data.disabilityType, // 2. disability_type
      formattedBirth, // 3. birth_date
      data.gender === "남성" ? "M" : "F", // 4. gender
      finalRelation, // 5. relationship
      data.postcode, // 6. zip_code
      fullAddress, // 7. address
      beneId, // 8. WHERE bene_id = ?
    ];
  },
};
