/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, $, _, window, app, type, appshell, document */

define(function (require, exports, module) {
    "use strict";

    var AppInit          = app.getModule("utils/AppInit"),
        Commands         = app.getModule("command/Commands"),
        CommandManager   = app.getModule("command/CommandManager"),
        MenuManager      = app.getModule("menu/MenuManager"),
        Repository       = app.getModule("core/Repository"),
        OperationBuilder = app.getModule("core/OperationBuilder"),
        SelectionManager = app.getModule("engine/SelectionManager"),
        UML              = app.getModule("uml/UML");

    /**
     * Commands IDs
     */
    var CMD_GENERATE_GETTERSETTER = 'tools.generate-gettersetter';

    /**
     * Change first character to upper case
     */
    function firstUpperCase(name) {
        if (name.length > 0) {
            return name[0].toUpperCase() + name.substr(1, name.length - 1);
        }
        return "";
    }
    
    /**
     * Generate a getter and a setter for an attribute
     *
     * @param {UMLAttribute} attr
     */
    function generateGetterSetter(attr) {
        var _class = attr._parent;
        
        OperationBuilder.begin("generate getter & setter");        

        // Getter
        var _getter = new type.UMLOperation();
        _getter.name = "get" + firstUpperCase(attr.name);
        _getter.visibility = UML.VK_PUBLIC;
        _getter._parent = _class;
        var _param1 = new type.UMLParameter();
        _param1.direction = UML.DK_RETURN;
        _param1.type = attr.type;
        _param1._parent = _getter;
        _getter.parameters.add(_param1);
        OperationBuilder.insert(_getter);
        OperationBuilder.fieldInsert(_class, "operations", _getter);

        // Setter
        var _setter = new type.UMLOperation();
        _setter.name = "set" + firstUpperCase(attr.name);
        _setter.visibility = UML.VK_PUBLIC;
        _setter._parent = _class;
        var _param2 = new type.UMLParameter();
        _param2.direction = UML.DK_IN;
        _param2.name = "value";
        _param2.type = attr.type;
        _param2._parent = _setter;
        _setter.parameters.add(_param2);
        OperationBuilder.insert(_setter);
        OperationBuilder.fieldInsert(_class, "operations", _setter);
        
        OperationBuilder.end();
        var cmd = OperationBuilder.getOperation();
        Repository.doOperation(cmd);        
    }
    
    /**
     * Command Handler for Generating Getters and Setters
     *
     * @param {Element} base
     * @param {string} path
     * @param {Object} options
     * @return {$.Promise}
     */
    function _handleGenerate(base, path, options) {
        var result = new $.Deferred();
            
        var selected = SelectionManager.getSelectedModels();
        selected.forEach(function (e) {
            if (e instanceof type.UMLAttribute) {
                generateGetterSetter(e);
            } else if (e instanceof type.UMLClassifier) {
                e.attributes.forEach(function (attr) {
                    generateGetterSetter(attr);
                });
            }
        });
        return result.promise();
    }

    // Register Commands
    CommandManager.register("Generate Getters & Setters", CMD_GENERATE_GETTERSETTER, _handleGenerate);

    var menu, menuItem;
    menu = MenuManager.getMenu(Commands.TOOLS);
    menuItem = menu.addMenuItem(CMD_GENERATE_GETTERSETTER, ["Ctrl-Alt-G"]);

});