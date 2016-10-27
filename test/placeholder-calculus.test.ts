import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { PlaceHolderCalculus, PlaceHolder } from '../src/placeholder-calculus';


suite("PlaceHolderCalculus Tests", () => {

    let placeHolderCalculus = new PlaceHolderCalculus();


    suite("Placeholder building Tests", () => {

        function buildTest(pre: string, expected: string) {
            let placeholder: PlaceHolder = new PlaceHolder();
            placeholder.index = placeHolderCalculus.getIndexByChar(pre);

            assert.equal(placeHolderCalculus.nextPlaceholder(placeholder).placeholder, expected);
        }

        test("first placeholder should be A", () => {
            assert.equal(placeHolderCalculus.nextPlaceholder(null).placeholder, "A");
        });

        test("next placeholder to A should be B", () => {
            buildTest("A", "B");
        });

        test("next placeholder to Z should be AA", () => {
            buildTest("Z", "AA");
        });

        test("next placeholder to AD should be AE", () => {
            buildTest("AD", "AE");
        });

        test("next placeholder to AZ should be BA", () => {
            buildTest("AZ", "BA");
        });

        test("next placeholder to BE should be BF", () => {
            buildTest("BE", "BF");
        });

        test("next placeholder to GAA should be GAB", () => {
            buildTest("GAA", "GAB");
        });

        test("next placeholder to ZZY should be ZZZ", () => {
            buildTest("ZZY", "ZZZ");
        });
    });

});