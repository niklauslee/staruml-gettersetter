/*
 * Copyright (c) 2014-2018 Minkyu Lee. All rights reserved.
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


/**
 * Generate an UMLOperation
 * name: string the name of the operation
 * visibility: visibility of the operation
 * parent: UMLClassifier
 * return UMLOperation
 */
function generateClassOperation (name, visibility, parent){
  let _variable = new type.UMLOperation()
  _variable.name = name
  _variable.visibility = visibility
  _variable._parent = parent
  return _variable
}

/**
 * add a parameter to a UML operation
 * direction: where the parameter go
 * type: type of the parameter
 * parent: UMLOperation
 * name(optional) for in parameter the name of the parameter
 */
function addParam (direction, paramType, parent, name=null, ){
  let _param = new type.UMLParameter()
  _param.direction = direction
  _param.type = paramType
  _param.parent = parent
  if(name) _param.name = name
  parent.parameters.push(_param)
}
/**
 * all type standard
 */
const writing = {

  /**
   * Change first character to upper case
   */
  firstUpperCase: (name) => {
    if (name.length > 0) {
      return name[0].toUpperCase() + name.substr(1, name.length - 1)
    }
    return ''
  },

  /**
   * add _ at the begining of the name for snake case compatibility
   * return string
   */
  snakeCase: (name)=> {
    if (name.length > 0) {
      return '_' + name
    }
    return ''
  }
}

const languageConstructorName = {
  /**
 * return name (java constructor)
 */
  java: (name) => {
    return name
  },

  /**
   * return 'constructor' (js constructor)
   */
  js: (name) => {
    return 'constructor'
  }

}

/**
 * object creating element
 */
const generator = {
    /**
   * Generate a getter and a setter for an attribute
   * @param {UMLAttribute} attr
   * @param {function} typeChoiceName
  */
  generateGetterSetter: (attr, typeChoiceName) => {
    var _class = attr._parent

    var builder = app.repository.getOperationBuilder()
    builder.begin('generate getter & setter')

    // Getter
    var _getter = generateClassOperation('get' + typeChoiceName(attr.name), type.UMLModelElement.VK_PUBLIC, _class)
    addParam(type.UMLParameter.DK_RETURN, attr.type, _getter)
    builder.insert(_getter)
    builder.fieldInsert(_class, 'operations', _getter)

    // Setter
    var _setter = generateClassOperation('set' + typeChoiceName(attr.name), type.UMLModelElement.VK_PUBLIC, _class)
    addParam(type.UMLParameter.DK_IN, attr.type, _setter, attr.name)
    addParam(type.UMLParameter.DK_RETURN, 'void', _setter)
    builder.insert(_setter)
    builder.fieldInsert(_class, 'operations', _setter)

    builder.end()
    var cmd = builder.getOperation()
    app.repository.doOperation(cmd)
  },
    /**
   * Generate a getter and a setter for an attribute
   * @param {UMLClassifier} classifier
   * UMLClass oof the constructor
   * @param {function} languageChoice
   * function returning constructor name from class name
   * @param {boolean} full
   * create constructor with all attributes or not
  */
  generateConstructor: (classifier, languageChoice, full=false) => {
    var builder = app.repository.getOperationBuilder()
    builder.begin('generate getter & setter')

    var _constructor = generateClassOperation(languageChoice(classifier.name), type.UMLModelElement.VK_PUBLIC, classifier)
    if (full){
      classifier.attributes.forEach(function (attr) {
        addParam(type.UMLParameter.DK_IN, attr.type, _constructor, attr.name)
      })
    }
    addParam(type.UMLParameter.DK_RETURN, 'void', _constructor)
    builder.insert(_constructor)
    builder.fieldInsert(classifier, 'operations', _constructor)
    builder.end()
    var cmd = builder.getOperation()
    app.repository.doOperation(cmd)
  }
}

const router = {
  /**
 * Command Handler for Generating Getters and Setters
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 * @return {$.Promise}
 */
  handleGenerateCamelCase: (base, path, options) => {
    var selected = app.selections.getSelectedModels()
    selected.forEach(function (e) {
      if (e instanceof type.UMLAttribute) {
        generator.generateGetterSetter(e)
      } else if (e instanceof type.UMLClassifier) {
        e.attributes.forEach(function (attr) {
          generator.generateGetterSetter(attr, writing.firstUpperCase)
        })
      }
    })
  },
  handleGenerateSnakeCase: (base, path, options) => {
    var selected = app.selections.getSelectedModels()
    selected.forEach(function (e) {
      if (e instanceof type.UMLAttribute) {
        generator.generateGetterSetter(e)
      } else if (e instanceof type.UMLClassifier) {
        e.attributes.forEach(function (attr) {
          generator.generateGetterSetter(attr, writing.snakeCase)
        })
      }
    })
  },
  handleGenerateJavaEmptyConstructor: (base, path, options) => {
    var selected = app.selections.getSelectedModels()
    selected.forEach(function (e) {
      if (e instanceof type.UMLClassifier) {
        generator.generateConstructor(e, languageConstructorName.java)
      }
    })
  },
  handleGenerateJavaFullConstructor: (base, path, options) => {
    var selected = app.selections.getSelectedModels()
    selected.forEach(function (e) {
      if (e instanceof type.UMLClassifier) {
        generator.generateConstructor(e, languageConstructorName.js, true)
      }
    })
  },
  handleGenerateJsEmptyConstructor: (base, path, options) => {
    var selected = app.selections.getSelectedModels()
    selected.forEach(function (e) {
      if (e instanceof type.UMLClassifier) {
        generator.generateConstructor(e, languageConstructorName.js)
      }
    })
  },

  handleGenerateJsFullConstructor: (base, path, options) => {
    var selected = app.selections.getSelectedModels()
    selected.forEach(function (e) {
      if (e instanceof type.UMLClassifier) {
        generator.generateConstructor(e, languageConstructorName.js, full=true)
      }
    })
  }
}


function init () {
  app.commands.register('gettersetter:generate_camel_case', router.handleGenerateCamelCase)
  app.commands.register('gettersetter:generate_snake_case', router.handleGenerateSnakeCase)
  app.commands.register('gettersetter:generate_empty_constructor_js', router.handleGenerateJsEmptyConstructor)
  app.commands.register('gettersetter:generate_full_constructor_js', router.handleGenerateJsFullConstructor)
  app.commands.register('gettersetter:generate_empty_constructor_java', router.handleGenerateJavaEmptyConstructor)
  app.commands.register('gettersetter:generate_full_constructor_java', router.handleGenerateJavaFullConstructor)
}

exports.init = init
