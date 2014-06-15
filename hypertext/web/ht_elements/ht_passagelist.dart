import 'dart:html';
import 'package:polymer/polymer.dart';
import 'ht_editorpane.dart';

@CustomTag('ht-passagelist')
class PassageList extends PolymerElement
{
    List<Passage> passages = toObservable([]);
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

    void select(Event e)
    {
        print("selected");
    }

    void addPassage(Event e)
    {
        passages.add(new Passage()
                        ..title = 'New Passage'
                        ..content = 'Start typing your passage here.');
        editorPane.passage = passages.last;
    }

    void selectPassage(Event e)
    {
        editorPane.passage = (e.target as PassageListItem).passage;
    }
}

class Passage
{
    String title = '';
    String content = '';
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
