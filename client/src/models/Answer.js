export class Answer {
    constructor(id, question_id, author_name, answer) {
        this.id = id;
        this.question_id = question_id
        this.author_name = author_name;
        this.answer = answer;
    }

    static from(json) {
        return new Answer(json.id, json.question_id, json.author_name, json.answer);
    }
}
