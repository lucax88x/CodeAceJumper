import * as vscode from 'vscode';
import * as _ from 'lodash';

import { ILineIndexes, IIndexes } from './acejump';


export class PlaceHolder {
    index: number;
    placeholder: string;
    line: number;
    character: number;

    root: PlaceHolder;
    childrens: PlaceHolder[] = [];
}

export class PlaceHolderCalculus {
    private static characters: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    // private characters: string[] = ["a", "b", "c"]

    constructor(private characters: string[] = PlaceHolderCalculus.characters) {
    }

    buildPlaceholders = (lineIndexes: ILineIndexes): PlaceHolder[] => {

        let placeholders: PlaceHolder[] = [];
        let count: number = 0;
        let candidate: number = 1;
        let map: PlaceHolder[][] = [];
        let breakCycles: boolean = false;

        for (let key in lineIndexes.indexes) {
            let line = parseInt(key);
            let lineIndex = lineIndexes.indexes[key];

            for (let i = 0; i < lineIndex.length; i++) {

                if (count + 1 > Math.pow(this.characters.length, 2)) {
                    breakCycles = true;
                    break;
                }

                let character = lineIndex[i];

                if (count >= this.characters.length) {
                    for (let y = candidate; y < placeholders.length; y++) {

                        let movingPlaceholder = placeholders[y];

                        let previousIndex = movingPlaceholder.index - 1;

                        if (map[previousIndex].length < this.characters.length) {
                            _.remove(map[movingPlaceholder.index], item => item === movingPlaceholder);

                            movingPlaceholder.index = previousIndex;

                            map[movingPlaceholder.index].push(movingPlaceholder);
                        }

                        movingPlaceholder.placeholder = this.characters[movingPlaceholder.index];
                    }
                    candidate++;
                }

                let placeholder = new PlaceHolder();

                placeholder.index = 0;

                let last = _.last(placeholders);

                if (last)
                    placeholder.index = last.index + 1;

                if (placeholder.index >= this.characters.length)
                    placeholder.index = this.characters.length - 1;

                placeholder.placeholder = this.characters[placeholder.index];

                placeholder.line = line;
                placeholder.character = character;

                if (!map[placeholder.index])
                    map[placeholder.index] = [];

                placeholders.push(placeholder);
                map[placeholder.index].push(placeholder);

                count++;
            }

            if (breakCycles)
                break;
        }

        // we assign root to other placeholders   
        _.each(_.filter(map, item => item.length > 1), mappedPlaceholders => {
            let root = mappedPlaceholders[0];

            for (let y = 0; y < mappedPlaceholders.length; y++) {

                let mappedPlaceholder: PlaceHolder = mappedPlaceholders[y];

                // first mappedPlaceholder is the root!
                if (y > 0)
                    mappedPlaceholder.root = root;

                let placeholder = new PlaceHolder();

                placeholder.index = y;
                placeholder.placeholder = this.characters[placeholder.index];

                placeholder.line = mappedPlaceholder.line;
                placeholder.character = mappedPlaceholder.character;

                // add a copy of placeholder as children of root
                root.childrens.push(placeholder);
            }
        });

        return placeholders;
    }

    getIndexByChar = (char: string): number => {
        return this.characters.indexOf(char);
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