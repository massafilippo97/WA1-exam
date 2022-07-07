export class Question {
    constructor(id, type = 0, question_text, answers, total_num_answers, min_ans_required = 0, max_ans_required=1, questionnaire_id) {
        this.id = id;
        this.type = type
        this.question_text = question_text;
        this.answers = answers;
        this.total_num_answers =total_num_answers;
        this.min_ans_required = min_ans_required;
        this.max_ans_required = max_ans_required;
        this.questionnaire_id = questionnaire_id;
    }

    static from(json) {
        return new Question(json.id, json.type, json.question_text, json.answers, json.total_num_answers, json.min_ans_required, json.max_ans_required, json.questionnaire_id);
    }
}
