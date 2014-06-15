import 'dart:html';
import 'package:polymer/polymer.dart';
import 'ht_passagelist.dart';

@CustomTag('ht-editorpane')
class EditorPane extends PolymerElement {

    Passage passage;
    PassageList passageList;

    EditorPane.created() : super.created();

    @override
    void attached() {
        super.attached();
        passageList = querySelector("#passage_list");
        passageList.editorPane = this;
    }

    @override
    void detached() {
        super.detached();
    }
    
    void updatePassage(Event e)
    {
        print("do something to update passage");
    }
}