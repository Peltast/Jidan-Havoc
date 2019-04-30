<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.2" tiledversion="1.2.3" name="PsychosisTileset" tilewidth="32" tileheight="32" tilecount="325" columns="13">
 <image source="../images/tiles/PsychosisTileset.png" width="416" height="800"/>
 <terraintypes>
  <terrain name="Wall" tile="-1">
   <properties>
    <property name="passable" value="false"/>
   </properties>
  </terrain>
  <terrain name="Ground" tile="-1">
   <properties>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="FakeChasm" tile="-1">
   <properties>
    <property name="fakeAlpha" value="0.01"/>
    <property name="fakeTerrain" value="28"/>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="FakeTopLeft" tile="92">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="53"/>
   </properties>
  </terrain>
  <terrain name="FakeTopMid" tile="93">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="54"/>
   </properties>
  </terrain>
  <terrain name="FakeTopRight" tile="94">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="55"/>
   </properties>
  </terrain>
  <terrain name="FakeTop" tile="95">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="44"/>
   </properties>
  </terrain>
  <terrain name="FakeMidLeft" tile="105">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="66"/>
   </properties>
  </terrain>
  <terrain name="FakeMidRight" tile="107">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="68"/>
   </properties>
  </terrain>
  <terrain name="FakeLeft" tile="108">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="56"/>
   </properties>
  </terrain>
  <terrain name="FakeRight" tile="110">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="58"/>
   </properties>
  </terrain>
  <terrain name="FakeBotLeft" tile="118">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="79"/>
   </properties>
  </terrain>
  <terrain name="FakeBotMid" tile="119">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="80"/>
   </properties>
  </terrain>
  <terrain name="FakeBotRight" tile="120">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="81"/>
   </properties>
  </terrain>
  <terrain name="FakeBot" tile="122">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="122"/>
   </properties>
  </terrain>
  <terrain name="HallucinationWall" tile="122">
   <properties>
    <property name="passable" value="false"/>
    <property name="realTerrain" value="0"/>
   </properties>
  </terrain>
  <terrain name="HallucinationGround" tile="106">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="28"/>
   </properties>
  </terrain>
  <terrain name="EyeTwitchLeft" tile="196">
   <properties>
    <property name="animation" value="EyeTwitchLeft"/>
    <property name="fakeTerrain" value="106"/>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="EyeTwitchRight" tile="209">
   <properties>
    <property name="animation" value="EyeTwitchRight"/>
    <property name="fakeTerrain" value="106"/>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="EyeRollLeft" tile="202">
   <properties>
    <property name="animation" value="EyeRollLeft"/>
    <property name="fakeTerrain" value="106"/>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="EyeRollRight" tile="215">
   <properties>
    <property name="animation" value="EyeRollRight"/>
    <property name="fakeTerrain" value="106"/>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="Grin" tile="163">
   <properties>
    <property name="fakeTerrain" value="106"/>
    <property name="passable" value="true"/>
   </properties>
  </terrain>
  <terrain name="InvisibleGround" tile="8">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="28"/>
   </properties>
  </terrain>
  <terrain name="InvertedWall" tile="0">
   <properties>
    <property name="passable" value="false"/>
    <property name="realTerrain" value="0"/>
   </properties>
  </terrain>
  <terrain name="InvertedGround" tile="0">
   <properties>
    <property name="passable" value="true"/>
    <property name="realTerrain" value="28"/>
   </properties>
  </terrain>
 </terraintypes>
 <tile id="0" terrain="0,0,0,0"/>
 <tile id="1" terrain="0,0,,"/>
 <tile id="2" terrain="0,0,,"/>
 <tile id="3" terrain="0,0,,"/>
 <tile id="4" terrain="0,0,,"/>
 <tile id="5" terrain="0,0,,"/>
 <tile id="6" terrain="1,1,1,1"/>
 <tile id="7" terrain="1,1,1,1"/>
 <tile id="8" terrain="22,22,22,22"/>
 <tile id="9" terrain="0,0,0,0"/>
 <tile id="10" terrain="0,0,,"/>
 <tile id="11" terrain="0,0,0,"/>
 <tile id="12" terrain="0,0,0,"/>
 <tile id="13" terrain="0,,0,"/>
 <tile id="14" terrain="1,1,1,1"/>
 <tile id="15" terrain="1,1,1,1"/>
 <tile id="16" terrain="1,1,1,1"/>
 <tile id="17" terrain="1,1,1,1"/>
 <tile id="18" terrain="1,1,1,1"/>
 <tile id="19" terrain="1,1,1,1"/>
 <tile id="20" terrain="1,1,1,1"/>
 <tile id="21" terrain="0,0,0,0"/>
 <tile id="22" terrain="0,0,0,0"/>
 <tile id="23" terrain="0,0,0,0"/>
 <tile id="24" terrain="0,,0,"/>
 <tile id="25" terrain="0,,0,"/>
 <tile id="26" terrain="0,,0,"/>
 <tile id="27" terrain="1,1,1,1"/>
 <tile id="28" terrain="1,1,1,1"/>
 <tile id="29" terrain="1,1,1,1"/>
 <tile id="30" terrain="1,1,1,1"/>
 <tile id="31" terrain="1,1,1,1"/>
 <tile id="32" terrain="1,1,1,1"/>
 <tile id="33" terrain="1,1,1,1"/>
 <tile id="34" terrain="0,0,0,0"/>
 <tile id="35" terrain="1,1,1,1"/>
 <tile id="36" terrain="0,0,0,0"/>
 <tile id="37" terrain="0,,0,"/>
 <tile id="38" terrain="0,,0,"/>
 <tile id="39" terrain="0,,0,"/>
 <tile id="40" terrain="1,1,1,1"/>
 <tile id="41" terrain="1,1,1,1"/>
 <tile id="42" terrain="1,1,1,1"/>
 <tile id="43" terrain="0,0,0,0"/>
 <tile id="44" terrain="1,1,1,1"/>
 <tile id="45" terrain="1,1,1,1"/>
 <tile id="46" terrain="1,1,1,1"/>
 <tile id="47" terrain="0,0,0,0"/>
 <tile id="48" terrain="0,0,0,0"/>
 <tile id="49" terrain="0,0,0,0"/>
 <tile id="50" terrain="0,,0,"/>
 <tile id="51" terrain="0,,0,"/>
 <tile id="52" terrain="0,,0,"/>
 <tile id="53" terrain="1,1,1,1"/>
 <tile id="54" terrain="1,1,1,1"/>
 <tile id="55" terrain="1,1,1,1"/>
 <tile id="56" terrain="1,1,1,1"/>
 <tile id="57" terrain="1,1,1,1"/>
 <tile id="58" terrain="1,1,1,1"/>
 <tile id="59" terrain="0,0,0,"/>
 <tile id="60" terrain="0,0,,"/>
 <tile id="61" terrain="0,0,0,0"/>
 <tile id="62" terrain="0,0,0,0"/>
 <tile id="63" terrain="0,0,0,0"/>
 <tile id="64" terrain="0,,0,"/>
 <tile id="65" terrain="0,,0,"/>
 <tile id="66" terrain="1,1,1,1"/>
 <tile id="67" terrain="1,1,1,1"/>
 <tile id="68" terrain="1,1,1,1"/>
 <tile id="69" terrain="0,0,0,0"/>
 <tile id="70" terrain="1,1,1,1"/>
 <tile id="71" terrain="0,0,0,0"/>
 <tile id="72" terrain="0,0,,"/>
 <tile id="73" terrain="0,0,0,0"/>
 <tile id="74" terrain="0,0,0,0"/>
 <tile id="75" terrain="0,0,,"/>
 <tile id="76" terrain="0,0,0,0"/>
 <tile id="77" terrain="0,,0,"/>
 <tile id="78" terrain="0,,0,"/>
 <tile id="79" terrain="1,1,1,1"/>
 <tile id="80" terrain="1,1,1,1"/>
 <tile id="81" terrain="1,1,1,1"/>
 <tile id="82" terrain="1,1,1,1"/>
 <tile id="83" terrain="1,1,1,1"/>
 <tile id="84" terrain="1,1,1,1"/>
 <tile id="85" terrain="1,1,1,1"/>
 <tile id="86" terrain="2,2,2,2"/>
 <tile id="87" terrain="1,1,1,1"/>
 <tile id="88" terrain="1,1,1,1"/>
 <tile id="89" terrain="1,1,1,1"/>
 <tile id="90" terrain="0,,0,"/>
 <tile id="91" terrain="0,,0,"/>
 <tile id="92" terrain="3,3,3,3"/>
 <tile id="93" terrain="4,4,4,4"/>
 <tile id="94" terrain="5,5,5,5"/>
 <tile id="95" terrain="6,6,6,6"/>
 <tile id="96" terrain="6,6,6,6"/>
 <tile id="97" terrain="3,3,3,3"/>
 <tile id="98" terrain="4,4,4,4"/>
 <tile id="99" terrain="5,5,5,5"/>
 <tile id="100" terrain="3,3,3,3"/>
 <tile id="101" terrain="4,4,4,4"/>
 <tile id="102" terrain="5,5,5,5"/>
 <tile id="103" terrain="0,,0,0"/>
 <tile id="104" terrain="0,,0,"/>
 <tile id="105" terrain="7,7,7,7"/>
 <tile id="106" terrain="16,16,16,16"/>
 <tile id="107" terrain="8,8,8,8"/>
 <tile id="108" terrain="9,9,9,9"/>
 <tile id="109" terrain="1,1,1,1"/>
 <tile id="110" terrain="10,10,10,10"/>
 <tile id="111" terrain="9,9,9,9"/>
 <tile id="112" terrain="10,10,10,10"/>
 <tile id="113" terrain="0,0,0,"/>
 <tile id="114" terrain="0,0,,"/>
 <tile id="115" terrain="0,0,,"/>
 <tile id="116" terrain="0,0,0,"/>
 <tile id="117" terrain="0,,0,"/>
 <tile id="118" terrain="11,11,11,11"/>
 <tile id="119" terrain="12,12,12,12"/>
 <tile id="120" terrain="13,13,13,13"/>
 <tile id="121" terrain="15,15,15,15"/>
 <tile id="122" terrain="14,14,14,14"/>
 <tile id="123" terrain="15,15,15,15"/>
 <tile id="124" terrain="22,22,22,22"/>
 <tile id="125" terrain="0,0,0,"/>
 <tile id="126" terrain="0,0,0,"/>
 <tile id="127" terrain="0,0,,"/>
 <tile id="128" terrain="0,0,,"/>
 <tile id="129" terrain="0,0,0,"/>
 <tile id="130" terrain="0,,0,"/>
 <tile id="131" terrain="15,15,15,15"/>
 <tile id="132" terrain="15,15,15,15"/>
 <tile id="133" terrain="15,15,15,15"/>
 <tile id="134" terrain="15,15,15,15"/>
 <tile id="135" terrain="15,15,15,15"/>
 <tile id="136" terrain="15,15,15,15"/>
 <tile id="137" terrain="22,22,22,22"/>
 <tile id="138" terrain="15,15,15,15"/>
 <tile id="139" terrain="15,15,15,15"/>
 <tile id="140" terrain="15,15,15,15"/>
 <tile id="141" terrain="15,15,15,15"/>
 <tile id="142" terrain="0,,0,"/>
 <tile id="143" terrain="0,,0,"/>
 <tile id="144" terrain="15,15,15,15"/>
 <tile id="145" terrain="15,15,15,15"/>
 <tile id="146" terrain="15,15,15,15"/>
 <tile id="147" terrain="0,,0,"/>
 <tile id="148" terrain="15,15,15,15"/>
 <tile id="149" terrain="15,15,15,15"/>
 <tile id="150" terrain="22,22,22,22"/>
 <tile id="151" terrain="15,15,15,15"/>
 <tile id="152" terrain="15,15,15,15"/>
 <tile id="153" terrain="15,15,15,15"/>
 <tile id="154" terrain="15,15,15,15"/>
 <tile id="155" terrain="0,0,0,"/>
 <tile id="156" terrain="0,,0,"/>
 <tile id="157" terrain="15,15,15,15"/>
 <tile id="158" terrain="15,15,15,15"/>
 <tile id="159" terrain="15,15,15,15"/>
 <tile id="160" terrain="0,,0,"/>
 <tile id="161" terrain="15,15,15,15"/>
 <tile id="162" terrain="15,15,15,15"/>
 <tile id="163" terrain="22,22,22,22"/>
 <tile id="164" terrain="15,15,15,15"/>
 <tile id="165" terrain="15,15,15,15"/>
 <tile id="166" terrain="15,15,15,15"/>
 <tile id="167" terrain="15,15,15,15"/>
 <tile id="168" terrain="0,,0,"/>
 <tile id="169" terrain="0,0,0,0"/>
 <tile id="170" terrain="15,15,15,15"/>
 <tile id="171" terrain="15,15,15,15"/>
 <tile id="172" terrain="15,15,15,15"/>
 <tile id="173" terrain="0,,0,"/>
 <tile id="174" terrain="15,15,15,15"/>
 <tile id="175" terrain="0,0,,"/>
 <tile id="176" terrain="22,22,22,22"/>
 <tile id="177" terrain="15,15,15,15"/>
 <tile id="178" terrain="15,15,15,15"/>
 <tile id="179" terrain="15,15,15,15"/>
 <tile id="180" terrain="15,15,15,15"/>
 <tile id="181" terrain="0,0,,"/>
 <tile id="182" terrain="0,0,0,0"/>
 <tile id="183" terrain="0,0,,"/>
 <tile id="184" terrain="0,0,,"/>
 <tile id="185" terrain="0,0,,"/>
 <tile id="186" terrain="0,0,,"/>
 <tile id="187" terrain="0,0,,"/>
 <tile id="188" terrain="0,0,,"/>
 <tile id="189" terrain="22,22,22,22"/>
 <tile id="190" terrain="0,0,,"/>
 <tile id="191" terrain="0,0,,"/>
 <tile id="192" terrain="0,0,,"/>
 <tile id="193" terrain="0,0,,"/>
 <tile id="194" terrain="0,0,,"/>
 <tile id="195" terrain="0,,0,"/>
 <tile id="196" terrain="17,17,17,17"/>
 <tile id="197" terrain="0,0,,"/>
 <tile id="198" terrain="0,0,,"/>
 <tile id="199" terrain="0,0,,"/>
 <tile id="200" terrain="0,0,,"/>
 <tile id="201" terrain="0,0,,"/>
 <tile id="202" terrain="19,19,19,19"/>
 <tile id="203" terrain="0,0,,"/>
 <tile id="204" terrain="0,0,,"/>
 <tile id="205" terrain="0,0,,"/>
 <tile id="206" terrain="0,0,,"/>
 <tile id="207" terrain="0,0,,"/>
 <tile id="208" terrain="0,,0,"/>
 <tile id="209" terrain="18,18,18,18"/>
 <tile id="210" terrain="0,0,,"/>
 <tile id="211" terrain="0,0,,"/>
 <tile id="212" terrain="0,0,,"/>
 <tile id="213" terrain="0,0,,"/>
 <tile id="214" terrain="0,0,,"/>
 <tile id="215" terrain="20,20,20,20"/>
 <tile id="216" terrain="0,0,,"/>
 <tile id="217" terrain="0,0,,"/>
 <tile id="218" terrain="0,0,,"/>
 <tile id="219" terrain="0,0,,"/>
 <tile id="220" terrain="0,0,,"/>
 <tile id="221" terrain="0,,0,"/>
 <tile id="222" terrain="21,21,21,21"/>
 <tile id="223" terrain="21,21,21,21"/>
 <tile id="224" terrain="21,21,21,21"/>
 <tile id="225" terrain="21,21,21,21"/>
 <tile id="226" terrain="21,21,21,21"/>
 <tile id="227" terrain="21,21,21,21"/>
 <tile id="228" terrain="0,0,0,"/>
 <tile id="229" terrain="0,0,,"/>
 <tile id="230" terrain="0,0,,"/>
 <tile id="231" terrain="0,0,,"/>
 <tile id="232" terrain="0,0,,"/>
 <tile id="233" terrain="0,0,0,"/>
 <tile id="234" terrain="0,,0,"/>
 <tile id="235" terrain="23,23,23,23"/>
 <tile id="236" terrain="23,23,23,23"/>
 <tile id="237" terrain="23,23,23,23"/>
 <tile id="238" terrain="23,23,23,23"/>
 <tile id="239" terrain="23,23,23,23"/>
 <tile id="240" terrain="23,23,23,23"/>
 <tile id="241" terrain="23,23,23,23"/>
 <tile id="242" terrain="23,23,23,23"/>
 <tile id="243" terrain="23,23,23,23"/>
 <tile id="244" terrain="23,23,23,23"/>
 <tile id="245" terrain="23,23,23,23"/>
 <tile id="246" terrain="0,,0,"/>
 <tile id="247" terrain="0,,0,"/>
 <tile id="248" terrain="23,23,23,23"/>
 <tile id="249" terrain="23,23,23,23"/>
 <tile id="250" terrain="23,23,23,23"/>
 <tile id="251" terrain="23,23,23,23"/>
 <tile id="252" terrain="23,23,23,23"/>
 <tile id="253" terrain="23,23,23,23"/>
 <tile id="254" terrain="23,23,23,23"/>
 <tile id="255" terrain="23,23,23,23"/>
 <tile id="256" terrain="0,,0,"/>
 <tile id="257" terrain="0,,0,"/>
 <tile id="258" terrain="0,,0,"/>
 <tile id="259" terrain="0,,0,"/>
 <tile id="260" terrain="0,,0,"/>
 <tile id="261" terrain="23,23,23,23"/>
 <tile id="262" terrain="23,23,23,23"/>
 <tile id="263" terrain="23,23,23,23"/>
 <tile id="264" terrain="24,24,24,24"/>
 <tile id="265" terrain="23,23,23,23"/>
 <tile id="266" terrain="24,24,24,24"/>
 <tile id="267" terrain="0,,0,"/>
 <tile id="268" terrain="0,,0,"/>
 <tile id="269" terrain="0,,0,"/>
 <tile id="270" terrain="0,,0,"/>
 <tile id="271" terrain="0,,0,"/>
 <tile id="272" terrain="0,,0,"/>
 <tile id="273" terrain="0,,0,"/>
 <tile id="274" terrain="24,24,24,24"/>
 <tile id="275" terrain="24,24,24,24"/>
 <tile id="276" terrain="24,24,24,24"/>
 <tile id="277" terrain="24,24,24,24"/>
 <tile id="278" terrain="24,24,24,24"/>
 <tile id="279" terrain="24,24,24,24"/>
 <tile id="280" terrain="0,,0,"/>
 <tile id="281" terrain="24,24,24,24"/>
 <tile id="282" terrain="24,24,24,24"/>
 <tile id="283" terrain="24,24,24,24"/>
 <tile id="284" terrain="24,24,24,24"/>
 <tile id="285" terrain="0,,0,"/>
 <tile id="286" terrain="0,,0,"/>
 <tile id="287" terrain="24,24,24,24"/>
 <tile id="288" terrain="24,24,24,24"/>
 <tile id="289" terrain="24,24,24,24"/>
 <tile id="290" terrain="0,,0,"/>
 <tile id="291" terrain="24,24,24,24"/>
 <tile id="292" terrain="24,24,24,24"/>
 <tile id="293" terrain="0,,0,"/>
 <tile id="294" terrain="24,24,24,24"/>
 <tile id="295" terrain="24,24,24,24"/>
 <tile id="296" terrain="24,24,24,24"/>
 <tile id="297" terrain="24,24,24,24"/>
 <tile id="298" terrain="0,,0,"/>
 <tile id="299" terrain="0,,0,"/>
 <tile id="300" terrain="24,24,24,24"/>
 <tile id="301" terrain="24,24,24,24"/>
 <tile id="302" terrain="24,24,24,24"/>
 <tile id="303" terrain="0,,0,"/>
 <tile id="304" terrain="24,24,24,24"/>
 <tile id="305" terrain="24,24,24,24"/>
 <tile id="306" terrain="0,,0,"/>
 <tile id="307" terrain="24,24,24,24"/>
 <tile id="308" terrain="24,24,24,24"/>
 <tile id="309" terrain="24,24,24,24"/>
 <tile id="310" terrain="24,24,24,24"/>
 <tile id="311" terrain="0,,0,"/>
 <tile id="312" terrain="0,,0,"/>
 <tile id="313" terrain="24,24,24,24"/>
 <tile id="314" terrain="24,24,24,24"/>
 <tile id="315" terrain="24,24,24,24"/>
 <tile id="316" terrain="0,,0,"/>
 <tile id="317" terrain="24,24,24,24"/>
 <tile id="318" terrain="0,,0,"/>
 <tile id="319" terrain="0,,0,"/>
 <tile id="320" terrain="24,24,24,24"/>
 <tile id="321" terrain="24,24,24,24"/>
 <tile id="322" terrain="24,24,24,24"/>
 <tile id="323" terrain="24,24,24,24"/>
 <tile id="324" terrain="0,,0,"/>
</tileset>
