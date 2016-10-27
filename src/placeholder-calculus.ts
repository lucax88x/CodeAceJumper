import * as vscode from 'vscode';
import * as _ from 'lodash';

import { IIndexes } from './acejump';


export class PlaceHolder {
    index: number;
    placeholder: string;
    line: number;
    character: number;
}

export class PlaceHolderCalculus {
    private characters: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    private preparedCharacters: string[] = [];

    constructor() {

        let firstLevel: string[] = [];
        let secondLevel: string[] = [];
        let thirdLevel: string[] = [];

        for (let i = 0; i < this.characters.length; i++) {
            firstLevel.push(this.characters[i]);
            for (let y = 0; y < this.characters.length; y++) {
                secondLevel.push(this.characters[i] + this.characters[y]);
                for (let z = 0; z < this.characters.length; z++) {
                    thirdLevel.push(this.characters[i] + this.characters[y] + this.characters[z]);
                }
            }
        }
        this.preparedCharacters = this.preparedCharacters.concat(firstLevel, secondLevel, thirdLevel)
    }

    buildPlaceholders = (lineIndexes: IIndexes): PlaceHolder[] => {

        let placeholders: PlaceHolder[] = [];

        let brokeCycle: boolean = false;
        _.forOwn<IIndexes>(lineIndexes, (lineIndex, key) => {
            let line = parseInt(key);

            _.each(lineIndex, (character) => {
                let placeholder = this.nextPlaceholder(_.last(placeholders));

                placeholder.line = line;
                placeholder.character = character;

                if (placeholder.index >= this.preparedCharacters.length) {
                    brokeCycle = true;
                    return false;
                }

                placeholders.push(placeholder);
            });

            if (brokeCycle)
                return false;
        });

        return placeholders;
    }

    getIndexByChar = (char: string): number => {
        return this.preparedCharacters.indexOf(char);
    }

    nextPlaceholder = (current: PlaceHolder): PlaceHolder => {
        let result = new PlaceHolder();
        result.index = 0;

        if (current) {
            result.index = current.index + 1;
        }

        result.placeholder = this.preparedCharacters[result.index];

        return result;
    }

    private isLastChar = (char: string) => {

        let index = this.characters.indexOf(char);
        return index + 1 >= this.characters.length;
    }

    private nextChar = (char: string) => {

        if (this.isLastChar(char)) {
            return this.characters[0];
        }
        else {
            let index = this.characters.indexOf(char);
            return this.characters[index + 1];
        }
    }
}