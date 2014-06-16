import 'dart:html';
import 'package:polymer/polymer.dart';
import 'ht_passagelist.dart';

@CustomTag('ht-editorpane')
class EditorPane extends PolymerElement {

    PassageList passageList;
    TextAreaElement contentBox;

    @observable Passage passage = new Passage()
                                    ..title = "Starting Passage"
                                    ..content = "Starting content to help you get going.";

    EditorPane.created() : super.created();

    @override
    void attached() {
        super.attached();
        passageList = querySelector("#passage_list");
        contentBox = $['content_box'];

        contentBox.value = passage.content;

        passageList.editorPane = this;
        passageList.addPassage(passage);
    }

    @override
    void detached() {
        super.detached();
    }

    void updatePassageContent(Event e)
    {
        passage.content = contentBox.value;
    }

    void setPassage(Passage p)
    {
        passage = p;
        contentBox.value = passage.content;
    }
}