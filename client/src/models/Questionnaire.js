export class Questionnaire {
    constructor(id, title, author, tot_answers) {
        this.id = id;
        this.title = title
        this.author = author;
        this.tot_answers = tot_answers;
    }

    static from(json) {
        return new Questionnaire(json.id, json.title, json.author, json.tot_answers);
    }
}
