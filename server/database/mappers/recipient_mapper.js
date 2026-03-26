module.exports = {
  mapForInsert: (data, familyId) => {
    // '기타' 선택 시 직접 입력값을, 아니면 라디오 값을 관계에 할당
    const finalRelation =
      data.relation === "기타" ? data.relationEtc : data.relation;

    // 기본 주소와 상세 주소를 공백으로 구분하여 하나로 합침
    const fullAddress = `${data.addr1} ${data.addr2}`.trim();

    // '19900101' -> '1990-01-01'로 변환하는 로직
    let formattedBirth = data.birth;
    if (data.birth && data.birth.length === 8) {
      formattedBirth = `${data.birth.substring(0, 4)}-${data.birth.substring(4, 6)}-${data.birth.substring(6, 8)}`;
    }

    // SQL 쿼리의 ? 순서와 일치하는 배열 반환
    return [
      familyId, // 보호자(유저) ID -> family_id
      data.name, // 대상자 성명 -> bene_name
      data.disabilityType, // 장애유형 -> disability_type
      formattedBirth, // 변환된 날짜 적용
      data.gender, // 성별 -> gender
      finalRelation, // 관계 -> relationship
      data.zipCode, // 우편번호 -> zip_code
      fullAddress, // 주소 전체 -> address
    ];
  },
};
