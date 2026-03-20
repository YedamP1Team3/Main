const selectSurvey = `
        SELECT 
            i.item_id, i.item_name, 
            s.sub_item_id, s.sub_item_name, 
            d.detail_id, d.question_text
        FROM survey_version v
        LEFT JOIN survey_item i ON v.version_id = i.version_id
        LEFT JOIN survey_sub_item s ON i.item_id = s.item_id
        LEFT JOIN survey_detail d ON s.sub_item_id = d.sub_item_id
        ORDER BY i.display_order, s.display_order, d.display_order
    `;
module.exports = {
  selectSurvey,
};
