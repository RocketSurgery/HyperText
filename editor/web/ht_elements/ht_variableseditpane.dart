import 'dart:html';
import 'dart:convert';
import 'package:polymer/polymer.dart';
import 'package:hypertext/hypertext.dart';

@CustomTag('ht-variableseditpane')
class EditorPane extends PolymerElement {
    
    TextAreaElement editBox;
    ParagraphElement messageArea;

    EditorPane.created() : super.created();

    @override
    void attached() {
        super.attached();
        
        editBox = $['edit_box'];
        editBox.value = '\{\n\n\}';
        
        messageArea = $['message_area'];
        messageArea.text = 'JSON is valid.';
    }

    @override
    void detached() {
        super.detached();
    }
    
    void updateVariables(Event e)
    {
        try
        {
            variables = (new JsonDecoder()).convert(editBox.value);
            messageArea.text = 'JSON is valid, variables map updated.';
        }
        catch (e)
        {
            messageArea.text = 'JSON is not valid.';
        }
    }
}