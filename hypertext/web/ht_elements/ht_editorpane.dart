import 'dart:html';
import 'package:polymer/polymer.dart';
import 'ht_passagelist.dart';

@CustomTag('ht-editorpane')
class EditorPane extends PolymerElement {

    @observable Passage passage = new Passage()
                                    ..title = "Starting Passage"
                                    ..content = "Starting content to help you get going.";
    PassageList passageList;

    EditorPane.created() : super.created();

    @override
    void attached() {
        super.attached();
        passageList = querySelector("#passage_list");
        passageList.editorPane = this;
        passageList.addPassage(passage);
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