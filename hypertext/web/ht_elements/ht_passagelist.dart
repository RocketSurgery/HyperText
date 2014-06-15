import 'dart:html';
import 'package:polymer/polymer.dart';
import 'ht_editorpane.dart';

@CustomTag('ht-passagelist')
class PassageList extends PolymerElement
{
    @observable List<Passage> passages = toObservable([]);
    EditorPane editorPane;

    PassageList.created() : super.created();

    @override
    void attached()
    {
        super.attached();
    }

    @override
    void detached()
    {
        super.detached();
    }

    void newPassage(Event e)
    {
        passages.add(new Passage()
                        ..title = 'New Passage'
                        ..content = 'Start typing your passage here.');
        editorPane.setPassage(passages.last);
    }

    void addPassage(Passage passage)
    {
        passages.add(passage);
    }

    void selectPassage(Event e)
    {
        editorPane.setPassage((e.target as PassageListItem).passage);
    }
}

class Passage extends Observable
{
    @observable String title = '';
    @observable String content = '';
}

@CustomTag('ht-passagelistitem')
class PassageListItem extends LIElement with Polymer, Observable
{
    @published Passage passage;

    PassageListItem.created() : super.created();

    @override
    void attached()
    {
        super.attached();
    }

    @override
    void detached()
    {
        super.detached();
    }
}
