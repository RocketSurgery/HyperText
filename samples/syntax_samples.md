<!--    This is a potential syntax using custom elements and Polymer's data binding
        It's not yet clear how feasible this would be, as it would require dynamic data
        binding to existing elements. -->
<ht-passage name="Introduction">
    You walk into the rotunda, gleaming marble and polished glass all around. Across the room you spot the window for the notary office and make your way to it. The receptionist is sullen but welcoming, and asks you to sign your name in the registry. You take the pen he offers you and write your name: <q>{{player.full_name}}</q>

    <ht-controlflow>
    <ht-if condition="{{player.perception}}">
        {{sawReceptionistShoot = true}}
        As you turn to take a seat, you notice that the reception acting shifty. You don't think much of it until...

        Suddenly the receptionist draws a gun on you! {{ player.reflexes > 4 ? "You dive out of the way, barely avoiding the shots which punch holes into your chair. {{player.health -= 1}}" : "You try to move out of the way but are grazed but grazed, drawing blood from your arms and tattering your clothes."}} You scramble around a marble column, breaking the receptionist's line of sight and buying yourself a moment's reprieve.
    </ht-if>
    <ht-else>
        {{sawReceptionistShoot = true}}
        You take a seat in one of the chairs outside the office and take out your phone, looking for a way to kill the time. Suddenly, shots ring out and you tumble back in your chair, bleeding from the shoulder! You scramble back and around a marble column, panting heavily. Your shoulder hurts and blood is seeping into your jacket, but it looks like you're only grazed.
    </ht-else>
    </ht-controlflow>
    <ht-next name="Escape">
</ht-passage>

<!-- This passage shows a simplified syntax which could be parsed into the above format
     This syntax is similar to the original plans for HTSyntax, but is similar to
     Polymer's data binding statements. -->
<ht-passage name="Escape">
    {{if !sawReceptionistShoot}}
    From behind the pillar you wonder who is shooting at you. You try peeking around too have a look only to have a few more shots glance off the marble and force you back into cover. But not before you see your shooter: the receptionist!
    {{endif}}

    You don't know why the receptionist wants to kill you, but you don't waste time trying finding out. After a few seconds catching your breath and steeling your nerves, you bolt for the nearest door. You hear shots but don't feel anything hit you. You manage to make it through the doors and into the hallway unscathed, though there's no telling whether or not the shooter is following you or how long you have before he catches up.
</ht-passage>
