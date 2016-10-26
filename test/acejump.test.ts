// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { AceJump, PlaceHolder } from '../src/acejump';


// Defines a Mocha test suite to group tests of similar kind together
suite("AceJump Tests", () => {

    let aceJump = new AceJump();


    suite("Placeholder building Tests", () => {

        function buildTest(pre: string, expected: string) {
            let placeholder: PlaceHolder = new PlaceHolder();
            placeholder.index = aceJump.preparedCharacters.indexOf(pre);

            assert.equal(aceJump.nextPlaceholder(placeholder).placeholder, expected);
        }

        test("first placeholder should be A", () => {
            assert.equal(aceJump.nextPlaceholder(null).placeholder, "A");
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