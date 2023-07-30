const Byid = function(id){return document.getElementById(id);}

function removeElement(id) {
  try
  {
    var elem = document.getElementById(id);
  return elem.parentNode.removeChild(elem);
  }catch{}
  
}

var Circle= function(x,y,id)
{
    id = id+'';
    return '<circle class = "circle" id = "P'+id+'" fill = "'+OptionsCircle.color+'" cx="'+x+'" cy="'+y+'" r="'+OptionsCircle.radius+'"/>'
}

var Metka= function(x,y,id,color)
{
    id = id+'';
    return '<circle tagName="Metka" class = "metka" id = "M'+id+'" fill = "'+color+'" cx="'+x+'" cy="'+y+'" r="15px"/>'
}
var MetkaGraf= function(x,y,id,color)
{
    id = id+'';
    return '<circle tagName="Metka" class = "metka" id = "M'+id+'" fill = "'+color+'" cx="'+x+'" cy="'+y+'" r="30px"/>'
}

var Rect = function(x,y,id)
{
    return '<rect class = "rect"  id ="T'+id+'" fill = "'+OptionsRect.color+'" x="'+x+'" y="'+y+'" width="'+OptionsRect.width+'" height="'+OptionsRect.height+'"/>'
}  

var Text1 = function(text,x,y,clas,id)
{
    return '<text onclick="SetNewText('+id+')" fill="black" id="'+id+'" text-anchor="middle" x="'+x+'" y="'+y+'" class="'+clas+' draggable">'+text+'</text>'
}    

var TempLine = function(x1,y1,x2,y2,color)
{
    return '<line id="Lin1" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" />';
}

var Line = function(x1,y1,x2,y2,color,id)
{
    
  return '<line onclick="SetNewSpeedLink('+id+')" class="Line" id="Link'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="3px"/>';
}


var OptionsCircle = 
{
  radius: '40px',
  color: 'green',
  count: 0
}
var OptionsRect = 
{
  width: '30px',
  height: '90px',
  color: 'rgb(122, 122, 122)',
  count: 0
}
var svgCanvas = document.getElementById("SVG");
var viewPort = document.getElementById("general_group");
var drag2 = false;
var offset = { x: 0, y: 0 };
var factor = .1;
var matrix = new DOMMatrix();
var startX;
var startY;
var FinX,FinY;
var FinalEL;
var Type;
var LinkCount = 0;
var Links = {};
var TempLineF = false;
var AllElement = {};
var FocusElement;
var CountMet = 0
var RunTime = false;
var Metks = {
  0:{
    element:'',
    run:false,
    timStart:'',
    timFinish:'',
    fulltime:0
  },
  1:{
    element:'',
    run:false,
    timStart:'',
    timFinish:'',
    fulltime:0
  },
  2:{element:'',
      run:false,
      timStart:'',
      timFinish:'',
      fulltime:0
  }
}
var xf1,xf2,yf1,yf2;
var SpeedM = {0:1000,1:1000,2:1000};
var classM;

////////////////////////////////////////////////////////////////////////
/////////////////////Графическая часть/////////////////////////////////
//////////////////////////////////////////////////////////////////////

function makeDraggable(evt) {
    var svg = evt.target;
    var StartEL;
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
    svg.addEventListener('touchstart', startDrag);
    svg.addEventListener('touchmove', drag);
    svg.addEventListener('touchend', endDrag);
    svg.addEventListener('touchleave', endDrag);
    svg.addEventListener('touchcancel', endDrag);
    function getMousePosition(evt) {
      //console.log(evt.clientX + ' ' +evt.clientY);
      var CTM = svg.getScreenCTM();
      if (evt.touches) { evt = evt.touches[0]; }
      return {
            x: (evt.clientX / matrix.a - CTM.e) / CTM.a,
            y: (evt.screenY/ matrix.a - CTM.f) / CTM.d
            };
    }
    var selectedElement, offset, transform;
    function initialiseDragging(evt) {
        offset = getMousePosition(evt);
        var transforms = selectedElement.transform.baseVal;
        if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) 
        {
          var translate = svg.createSVGTransform();
          translate.setTranslate(0, 0);
          selectedElement.transform.baseVal.insertItemBefore(translate, 0);
        }
        transform = transforms.getItem(0);
        offset.x -= transform.matrix.e;
        offset.y -= transform.matrix.f;
    }
    function startDrag(evt) {
      Type = evt.path[0].tagName;
      if(Type != 'svg' && Type != 'Metka' && Type != 'line')
      {
        StartEL =  evt.path[0].id;
        if(FocusElement)
        {
            Byid(FocusElement).style = 'stroke: none;';
                
        }
              Byid(StartEL).style = 'stroke: rgb(206, 46, 46);';
              FocusElement = StartEL;
      }else
      {
        try
        {
          Byid(FocusElement).style = 'stroke: none;';
          FocusElement = '';
        }catch
        {
          FocusElement = '';
        }
      }
      if(evt.path[0].id[0] == 'M'){return}
      if (evt.target.classList.contains('draggable')) 
        {
            selectedElement = evt.target;
            
            initialiseDragging(evt);
        } else if (evt.target.parentNode.classList.contains('draggable-group')) 
        {     
                  selectedElement = evt.target.parentNode;
                  initialiseDragging(evt);
                  if(evt.ctrlKey)
                  {
                      var Elem = evt.toElement.parentNode.attributes.transform.value;
                      startX = +Elem.substring(10,Elem.length).split(' ')[0] + 200;
                      str = Elem.substring(10,Elem.length).split(' ')[1];
                      startY = +str.substring(0,str.length-1) + 200
                      if(Type == 'rect')
                      {
                        startY += OptionsRect.height.split('p')[0] / 2;
                        startX += OptionsRect.width.split('p')[0] / 2;
                      }
                      
                      Byid('general_group2').innerHTML += TempLine(startX,startY,startX,startY,'black');
                      TempLineF = true;
                  }  
        }
    }
    function drag(evt) {
      if (selectedElement) {
        drag2 = false;
        if(!evt.ctrlKey)
        {
          
        evt.preventDefault();
        var coord = getMousePosition(evt);
        transform.setTranslate(coord.x - offset.x, coord.y - offset.y);
        GoodLink(StartEL,coord.x - offset.x+200,coord.y - offset.y+200);
        }else
        {
          evt.preventDefault();
          var coord = getMousePosition(evt);
          Byid('Lin1').setAttributeNS(null, "x2", coord.x - offset.x +200);
          if(Type == 'rect')
          {
            Byid('Lin1').setAttributeNS(null, "y2", coord.y - offset.y +200 + OptionsRect.height.split('p')[0] / 2);
          }else
          {
            Byid('Lin1').setAttributeNS(null, "y2", coord.y - offset.y +200);
          }
          
          FinalEL = document.elementFromPoint(evt.clientX, evt.clientY);
        }
      }
    }
    function endDrag(evt) {
      selectedElement = false;
      if(evt.ctrlKey)
      {
        removeElement('Lin1');
        CreateLine(FinalEL,Type, StartEL);
        StartEL = '';
      }
      if(TempLineF)
      removeElement('Lin1');
      TempLineF = false;
    }


    function CreateLine(FinalEL,Type, idStartEL)
    {
      if(Type == FinalEL.tagName || FinalEL.tagName == 'svg'){return}
      if(FinalEL.parentNode.attributes.transform)
      {
        var Elem = FinalEL.parentNode.attributes.transform.value;
        FinX = +Elem.substring(10,Elem.length).split(' ')[0] + 200;
        FinY = Elem.substring(10,Elem.length).split(' ')[1];
        FinY = +FinY.substring(0,FinY.length-1) + 200;
      }else
      {
        FinX = 200;
        FinY = 200
      } 
      
      var biasY = OptionsRect.height.split('p')[0] / 2;
      var biasX = OptionsRect.width.split('p')[0] / 2;
      var CountLink = 0;

      for(key in Links)
      {
        if(Links[key].Start == idStartEL && Links[key].Final == FinalEL.id)
        {
          CountLink +=1;
        }
      }

      CountLink = CountLink *10;




      if(Type == 'circle')
      {
        Byid('general_group_Links').innerHTML += Line(startX,startY + CountLink,(FinX+biasX),(FinY+biasY) + CountLink,'green',LinkCount);
      }
      if(Type == 'rect')
      {
        Byid('general_group_Links').innerHTML += Line((startX),startY+ CountLink,FinX,FinY + CountLink,'black',LinkCount);
      }
      Links['Link'+LinkCount] = {};
      Links['Link'+LinkCount]['Start'] = idStartEL;
      Links['Link'+LinkCount]['Final'] = FinalEL.id;
      Links['Link'+LinkCount]['Speed'] = {};
      Links['Link'+LinkCount]['Speed'][0] = SpeedM[0];
      Links['Link'+LinkCount]['Speed'][1] = SpeedM[1];
      Links['Link'+LinkCount]['Speed'][2] = SpeedM[2];
      AllElement[idStartEL]['Link'+LinkCount] = {}
      AllElement[FinalEL.id]['Link'+LinkCount] = {}
      AllElement[idStartEL]['Link'+LinkCount]['Type'] = 'set';
      AllElement[FinalEL.id]['Link'+LinkCount]['Type'] = 'get';
      console.log(Links)
      LinkCount +=1;
    }

    function GoodLink(id,x,y)
    {
      var Element = AllElement[id];

      for(key in Element)
      {
        if(Element[key]['Type'] == 'set')
        {
          changesTransform(key,x,y,1)
        }
        if(Element[key]['Type'] == 'get')
        {
          changesTransform(key,x,y,2)
        }
      }

      function changesTransform(id,x,y,Num)
      {
        if(Type == 'rect')
        {
          Byid(id).setAttributeNS(null, "x"+Num, x + OptionsRect.width.split('p')[0] / 2);
          Byid(id).setAttributeNS(null, "y"+Num, y + OptionsRect.height.split('p')[0] / 2);
        }else
        {
          Byid(id).setAttributeNS(null, "x"+Num,x);
          Byid(id).setAttributeNS(null, "y"+Num, y);
        }
      }

    }


  }

svgCanvas.addEventListener('pointerdown', function (event) {
    if (!event.target.classList.contains('draggable') || !event.target.classList.contains('draggable-group'))
    {
      drag2 = true;
      offset = { x: event.offsetX, y: event.offsetY };
    }   
});

svgCanvas.addEventListener('pointermove', function (event) {
    if (drag2) {
        var tx = event.offsetX - offset.x;
        var ty = event.offsetY - offset.y;
        offset = {
            x: event.offsetX,
            y: event.offsetY
        };
        matrix.preMultiplySelf(new DOMMatrix()
            .translateSelf(tx, ty));
        viewPort.style.transform = matrix.toString();
    }
});

svgCanvas.addEventListener('pointerup', function (event) {
    drag2 = false;
});

svgCanvas.addEventListener('wheel', function (event) {
    var zoom = event.deltaY > 0 ? -1 : 1;
    var scale = 1 + factor * zoom;
    offset = {
        x: event.offsetX,
        y: event.offsetY
    };
    matrix.preMultiplySelf(new DOMMatrix()
        .translateSelf(offset.x, offset.y)
        .scaleSelf(scale, scale)
        .translateSelf(-offset.x, -offset.y));
    viewPort.style.transform = matrix.toString();
});
////////////////////////////////////////////////////////////////////////
/////////////////////Логическая часть//////////////////////////////////
//////////////////////////////////////////////////////////////////////

function AnalizLink()
{
  for(key3 in AllElement)
  {
    for(key2 in AllElement[key3])
    {
      if(AllElement[key3][key2]['Type'] == 'set')
      if(AllElement[key3][key2]['Metka'])
      if(AllElement[key3][key2]['Metka'].length != 0)
      {
        SortM(key3);
        PUSK(AllElement[key3]);
        break;
      }
    }
  }

  function Tic()
  {
    var flagZ = true;
    var time;
    var elm;
    for(key3 in AllElement)
    {
      for(key2 in AllElement[key3])
      {
        if(AllElement[key3][key2]['Type'] == 'set')
        if(AllElement[key3][key2]['Metka'])
        if(AllElement[key3][key2]['Metka'].length != 0)
        {
          PUSK(AllElement[key3]);
          flagZ = false;
          break;
        }
      }
    }
    if(flagZ)
    {
      alert('внимание образовалось узкое место');
    }
  }



  function SortM(ObjKey)
  {
    var Elem = AllElement[ObjKey];
    var ClasMet = {0:0,1:0,2:0}
    var Tm;
    for(key in Elem)
    {
      if(Elem[key]['Type'] == 'set')
      {
        for(var i =0;  i < Elem[key]['Metka'].length; i++)
        {
          Tm = Elem[key]['Metka'][i].split('$');
          switch(+Tm[0][2])
          {
            case 0: ClasMet[0] +=1; break;
            case 1: ClasMet[1] +=1; break;
            case 2: ClasMet[2] +=1; break;
          }
        }
        break; 
      }
    }

    for(key in AllElement[ObjKey])
    {
      if(AllElement[ObjKey][key]['Type'] == 'set')
      {
        for(var i =0; i < AllElement[ObjKey][key]['Metka'].length; i++)
        {
          Byid(AllElement[ObjKey][key]['Metka'][i]).remove();
        }
        delete AllElement[ObjKey][key]['Metka'];
      }
    }
    
    for(var i=0; i < 3; i++)
    {
      for(var j =0; j < ClasMet[i]; j++)
      {
        CreateMet(Byid(ObjKey),i,false);
      }
    }
  }





  function PUSK(object)
  {
    if(!RunTime){return}
      var Link = [], type = [], idMet = {};
      var Interval = {};
      var FinElement;
      var Speed;
      var clas;
      var Flagbosy = true;
      for(key in object)
      {
        Link.push(key);
        type.push(object[key]['Type']);
        if(object[key]['Type'] == 'set')
        idMet[key] = object[key]['Metka'];
      }

      for(key in idMet)
      {
        for(var i =0; i < idMet[key].length;i++)
        {
          FinElement = Links[key];
          if(AllElement[FinElement.Final][key]['Type'] == 'delete')
          {
            AllElement[FinElement.Final][key]['Type']= 'get';
            var mes = Byid(FinElement.Start).parentNode.childNodes[1].innerHTML;
            Byid(FinElement.Start).style.fill = 'red';
            AllElement[FinElement.Start][key]['Type'] = 'delete';
            alert('Внимание не сработала позиция '+mes );
            return;
          }
          switch(+(idMet[key][i][2]))
          {
            case 0: clas =0; Speed = SpeedM[0]; break;
            case 1: clas =1; Speed = SpeedM[1]; break;
            case 2: clas =2; Speed = SpeedM[2]; break;
          }
          if(Speed == FinElement.Speed[clas])
          {
            Speed = Speed/100;
          }else
          {
            if(FinElement.Speed[clas] == 1000)
            {
              Speed = Speed/100;
            }else
            {
              Speed = FinElement.Speed[clas]/100;
            }
          }
          Interval['shag'+key+i] = 0;
          Interval['tim'+key+i] = setInterval(MoveMet,Speed,+Byid(key).attributes.x1.value, +Byid(key).attributes.y1.value, +Byid(key).attributes.x2.value,
          +Byid(key).attributes.y2.value,idMet[key][i],i,FinElement,key);
          AllElement[FinElement.Start][key]['Type'] = 'bosy'
          AllElement[FinElement.Start][key]['Metka'].splice(0,1);
          break;
        }
      }
      function MoveMet(x1,y1,x2,y2,idMet,i,FinEl,Link)
      {
        if(Interval['shag'+Link+i] >100){F(Interval['tim'+Link+i],idMet,FinEl,Link); return;}
        var El = Byid(idMet);
        var hx = (x2-x1)/100;
        var hy = (y2 - y1)/100;
        var T = [0,0];
        if(Interval['shag'+Link+i] != 0)
          T = GetTransform(El);
          hx += T[0];
          hy += T[1];
        El.setAttribute('transform','translate('+hx+','+hy+')');
        Interval['shag'+Link+i] +=1;
      }




      function F(time,idMet,FinalElement,Link)
      {
        AllElement[FinalElement.Start][Link]['Type'] = 'set';
        clearInterval(time)
        var GetLinks=0;
        var SetLinks = 0
        var flagM2 = true;
        var LM = {}
        if(!(AllElement[FinalElement.Final][Link]['Metka']))
        AllElement[FinalElement.Final][Link]['Metka'] = [];
        AllElement[FinalElement.Final][Link]['Metka'].push(idMet);
        

        for(key in AllElement[FinalElement.Final])
        {
          if(AllElement[FinalElement.Final][key]['Type'] == 'get')
            GetLinks +=1;
          if(AllElement[FinalElement.Final][key]['Type'] == 'set')
            SetLinks +=1;
        }
        var a =0;
        for(key in AllElement[FinalElement.Final])
        { if(AllElement[FinalElement.Final][key]['Type'] == 'set'){continue;}
          if(AllElement[FinalElement.Final][key]['Type'] == 'get' && AllElement[FinalElement.Final][key]['Metka'])
          {
            if(AllElement[FinalElement.Final][key]['Metka'].length !=0)
            a+=1;
          }
        }
        if(a == GetLinks)
        {
          flagM2 = true;
        }else
        {
          flagM2 = false;
        }
        if(flagM2)
        {
          for(key in AllElement[FinalElement.Final])
          {
            if(AllElement[FinalElement.Final][key]['Type'] == 'get')
            {
              LM[key] = AllElement[FinalElement.Final][key]['Metka'];
            }
          }
          Examination(LM,FinalElement.Final,GetLinks)
        }else
        {
          if(FinalElement.Final[0] == 'P')
          {
            for(key in AllElement[FinalElement.Final])
          {
            if(AllElement[FinalElement.Final][key]['Type'] == 'get' && AllElement[FinalElement.Final][key]['Metka'])
            if(AllElement[FinalElement.Final][key]['Metka'].length)
            {
              LM[key] = AllElement[FinalElement.Final][key]['Metka'];
            }
          }
          Examination(LM,FinalElement.Final,a)
          }
        }

       
        Byid(idMet).remove();

        function Examination(LM,Elem,GetLinks)
        {
          var element;
          var ob = {};
          for(key in LM)
          {
            for(var i =0; i < LM[Object.keys(LM)[0]].length; i++)
            {
              if(element)
              {
                if(element[2] == LM[key][i][2])
                {
                  if(ob[element[2]])
                  {
                    ob[element[2]].push(LM[key][i]);
                  }else
                  {
                    ob[element[2]] = [];
                    ob[element[2]].push(element);
                    ob[element[2]].push(LM[key][i]);
                  }
                }
              }
              element = LM[key][i];
              if(LM[Object.keys(LM)[0]].length == 1 && !(Object.keys(ob)[0]))
              {
                if(Object.keys(ob)[0])
                { 
                  if(element[2] == Object.keys(ob)[0])
                  {
                    if(!(ob[element[2]]))
                    ob[element[2]] = [];
                    ob[element[2]].push(element);
                  }
                }else
                {
                  if(!(ob[element[2]]))
                  ob[element[2]] = [];
                  ob[element[2]].push(element);
                }
              }
              break;
            }
          }

          for(key in ob)
          {
            if(ob[key].length == GetLinks)
            CreateMet(Byid(Elem),+key,false);
          }

          var ind;
          for(key in LM)
          {
            for(index in ob)
            {
              for(var i =0; i < ob[Object.keys(ob)[0]].length; i++)
              {
                ind =  AllElement[Elem][key]['Metka'].indexOf(ob[index][i]);
                if(ind >=0)
                {
                  AllElement[Elem][key]['Metka'].splice(ind,1);
                  if(AllElement[Elem][key]['Metka'].length == 0)
                  {
                    delete AllElement[Elem][key]['Metka'].length
                  }
                }
              }
            }
          }

          Tic();
        }
      }
  }

}
function GetTransform(elem)
      {
        if(!(elem.attributes.transform)){return [0,0];}
        var Elem = elem.attributes.transform.value;
        var FinX = +Elem.substring(10,Elem.length).split(',')[0];
        var FinY = Elem.substring(10,Elem.length).split(',')[1];
        FinY = +FinY.substring(0,FinY.length-1);
        return [FinX,FinY];
      }

Byid('GroupBTN1_plus').onclick = function()
{
  var Elem = Byid(FocusElement)
  if(Elem.tagName == 'svg' || Elem.tagName == 'rect'){return}
  switch(true)
  {
    case Byid('Cl1').checked:
      classM = 0;
      break;
    case Byid('Cl2').checked:
      classM = 1;
      break;
    case Byid('Cl3').checked:
      classM = 2;
      break;      
  }

  Elem.setAttribute('r','60px');
  
  CreateMet(Elem,classM,true);
  if(RunTime)
  { 
    Metks[classM]['element'] = FocusElement;
    Metks[classM]['run'] = true;
    Metks[classM]['timStart'] = performance.now();
  }
  console.log(AllElement)
}  

function CreateMet(Elem,classMetki,client)
{
  var g = Elem.parentNode;
  var color;
  var count = 0;
  switch(classMetki)
  {
    case 0: color = 'blue'; break
    case 1: color = 'red'; break
    case 2: color = 'rgb(19,19,19)'; break
  }  
  for(key in AllElement[Elem.id])
  {
    if(AllElement[Elem.id][key]['Type'] == 'set' || AllElement[Elem.id][key]['Type'] == 'bosy')
    {
      if(AllElement[Elem.id][key]['Metka'])
      {
        AllElement[Elem.id][key]['Metka'].push('M'+'C'+classMetki + '$' +CountMet);
      }else
      {
        AllElement[Elem.id][key]['Metka'] = [];
        AllElement[Elem.id][key]['Metka'].push('M'+'C'+classMetki + '$' +CountMet);
      }
      if(count == 0)
      count = AllElement[Elem.id][key]['Metka'].length;
      if(count == 2 && Byid(Elem.id).style.fill != 'rgb(119, 0, 255)'){
        Byid(Elem.id).style.fill = 'rgb(119, 0, 255)';
        alert('Внимание образовался затор!!');
      }
      if(count == 1)
      {
        if(Elem.type == 'cirle')
        Byid(Elem.id).style.fill = 'green';
      }
      CreateObM(Elem,'C'+classMetki + '$' +CountMet,color,g,count);
      CountMet +=1;
    }
  }

  function CreateObM(Elem,id,color,g,count)
  {
      if(Elem.tagName == 'rect')
      {
        g.innerHTML += Metka(200+ OptionsRect.width.split('p')[0] / 2,200+ OptionsRect.height.split('p')[0] / 2,id,color);
      }else
      {
        g.innerHTML += Metka(200,200,id,color);
      }
      if(count >2)
      {
        if(CountMet%2 == 0)
        {
          Byid('M'+id).setAttribute('transform','translate('+10+','+10+')');
        }
        if(CountMet%3 == 0)
        {
          Byid('M'+id).setAttribute('transform','translate('+-10+','+10+')');
        }
        if(CountMet%4 == 0)
        {
          Byid('M'+id).setAttribute('transform','translate('+-10+','+-10+')');
        }
        if(CountMet%5 == 0)
        {
          Byid('M'+id).setAttribute('transform','translate('+10+','+-10+')');
        }
      }
  }
  
}


function AnalizLine(ElementID,StartEL,clas)
{
  var StartElement = Byid(ElementID);
  var SetLinkC = 0;
  var SetLinkM = [];
  for(key in AllElement[ElementID])
  {
      if(AllElement[ElementID][key]['Type'] == 'set')
      {
        SetLinkC +=1;
        SetLinkM.push(key);
      }
  }

  switch(SetLinkC)
  {
    case 0: return; break;
    case 1:
      var Speed; 
        if(Links[SetLinkM[0]]['Speed'][clas] == 1000)
        {
          Speed =SpeedM[clas]
        }else
        {
          Speed = Links[SetLinkM[0]]['Speed'][clas];
        }
        Metks[clas].fulltime += Speed;
      
      if(Links[SetLinkM[0]].Final != StartEL)
      {
        AnalizLine(Links[SetLinkM[0]].Final,StartEL,clas);
      }else{return;}
    break;
    
    default:
      var Obcount ={}
      var count =0;
      var Speed; 
        if(Links[SetLinkM[0]]['Speed'][clas] == 1000)
        {
          Speed =SpeedM[clas]
        }else
        {
          Speed = Links[SetLinkM[0]]['Speed'][clas];
        }
      for(var i =0; i < SetLinkM.length; i++)
      {
        Obcount[i] = Speed + Rec2(Links[SetLinkM[i]].Final,count,StartEL,clas)
      }
      var countmax = {0:0,1:0,2:0};
      for(key in Obcount)
      {
          if(Obcount[key] > countmax[clas])
          {
            countmax[clas] = Obcount[key];
          }
      }
      Metks[clas].fulltime += countmax[clas];
    break;
  }
  
}



function Rec2(ElemID,count,StartEL,clas)
{
  this.count = count;
  var StartElement = Byid(ElemID);
  var SetLinkC = 0;
  var SetLinkM = [];
  for(key in AllElement[ElemID])
  {
      if(AllElement[ElemID][key]['Type'] == 'set')
      {
        SetLinkC +=1;
        SetLinkM.push(key);
      }
  }
  if(ElemID == StartEL)
  {
    return this.count
  }

  switch(SetLinkC)
  {
    case 0: return this.count; break;
    case 1: 
    var Speed; 
    if(Links[SetLinkM[0]]['Speed'][clas] == 1000)
    {
      Speed =SpeedM[clas]
    }else
    {
      Speed = Links[SetLinkM[0]]['Speed'][clas];
    }
        count += Speed;
       return Rec2(Links[SetLinkM[0]].Final,count,StartEL,clas)
    break;

    default:
      var Obcount ={}
      var count =0;
      var Speed; 
      if(Links[SetLinkM[0]]['Speed'][clas] == 1000)
      {
        Speed =SpeedM[clas]
      }else
      {
        Speed = Links[SetLinkM[0]]['Speed'][clas];
      }
      for(var i =0; i < SetLinkM.length; i++)
      {
        Obcount[i] = Speed + Rec2(Links[SetLinkM[i]].Final,count,StartEL,clas)
      }
      var countmax = {0:0,1:0,2:0};
      for(key in Obcount)
      {
          if(Obcount[key] > countmax[clas])
          {
            countmax[clas] = Obcount[key];
          }
      }
      return countmax;
    break;
  }
}


  Byid('GroupBTN1_Minus').onclick = function()
  {
    var Elem = Byid(FocusElement);
    if(Elem.tagName == 'svg' || Elem.tagName == 'line'){return}
    for(key in AllElement[FocusElement])
    {
      if(AllElement[FocusElement][key]['Metka'])
    {
      for(var i =0; i < AllElement[FocusElement][key]['Metka'].length; i++)
      {
        Byid(AllElement[FocusElement][key]['Metka'][i]).remove();
      }
      delete AllElement[FocusElement][key]['Metka'];
    }
    }
    if(AllElement[FocusElement]['Метки'])
    delete AllElement[FocusElement]['Метки'];
    }

  Byid('GroupBTN2_P').onclick = function()
    {
      var id = ++OptionsCircle.count;
      Byid('general_group2').innerHTML += ' <g class=" draggable-group">' + Circle(200,200,id) + Text1('P' + id,200,140,'textP','TextP'+id) + '</g>';
      AllElement['P'+id] = {};
    }
  Byid('GroupBTN2_T').onclick = function()
    {
      var id = ++OptionsRect.count;
      Byid('general_group2').innerHTML += '<g class=" draggable-group">' + Rect(200,200,id) + Text1('T' + id,216,180,'textT','TextT'+id) + '</g>';
      AllElement['T'+id] = {};
    }


    function SetNewText(elem)
    {
      var text =  prompt('Введите название элемента',elem.innerHTML);
      if(text)
      {
        elem.innerHTML = text;
      }
    }

 

  Byid('GroupBTN2_DH').onclick = function()
  {
    Byid('general_group2').innerHTML = '<g id="general_group_Links"></g>';
    AllElement = {}
    Links = {};
    LinkCount =0; 
    OptionsCircle.count =0;
    OptionsRect.count = 0;
    FocusElement = '';
    CountMet = 0;
    Byid('Open').value = '';
  }

  Byid('GroupBTN2_D').onclick = function()
  {
    if(!FocusElement){return}
    for(key in AllElement[FocusElement])
    {
      if(key != 'Metka' && key != 'Метки')
      {
        delete AllElement[Links[key].Start][key];
        delete AllElement[Links[key].Final][key];
        delete Links[key];
        Byid(key).remove();
      }
    }
    delete AllElement[FocusElement];
    Byid(FocusElement).parentNode.remove();
    FocusElement = '';
  }


  Byid('GroupBTN3_Start').onclick = function()
  {
    RunTime = true;
    AnalizLink();
  }



  function LineGraf(clas)
  {
    var Lin = Byid('general_group2').getBoundingClientRect();
    var GeneralOb = Byid('general_group');
    var color;
    xf1 = (Lin.x/matrix.a)-(matrix.e/matrix.d)
    yf1 = ((Lin.y+Lin.height)/matrix.a)-(matrix.f/matrix.d);
    xf2 = ((Lin.width+Lin.x)/matrix.a)-(matrix.e/matrix.d)
    yf2 = ((Lin.y+Lin.height)/matrix.a)-(matrix.f/matrix.d);
  
    switch(+clas)
    {
      case 0:
      color = 'blue';
      break;
      case 1:
      yf1 += 100;
      yf2 += 100;  
      color = 'red';
      break;
      case 2:
        yf1 += 200;
        yf2 += 200;  
        color = 'rgb(19,19,19)'
      break;
    }
  
    GeneralOb.innerHTML += Line(xf1,yf1,xf2,yf2,'black',clas+'Graf');
    GeneralOb.innerHTML +=Line(xf1,yf1-30,xf1,yf1+30,'black',clas+'Graf'+'S1');
    GeneralOb.innerHTML +=Line(xf2,yf2-30,xf2,yf2+30,'black',clas+'Graf'+'S2');
    GeneralOb.innerHTML += MetkaGraf(xf1,yf1,'F'+clas,color);
    var Speed = Metks[clas].timFinish-Metks[clas].timStart;

    newLineT(Speed,xf1,yf1,xf2,yf2,clas)

    function newLineT(Speed,xf1,yf1,xf2,yf2,clas)
    {
      var j = 0;
      let timer = setInterval(MoveMet,Speed/1000,xf1,yf1,xf2,yf2,'MF'+clas);
      function MoveMet(x1,y1,x2,y2,idMet)
      {
        if(j >1000){clearInterval(timer); F()}
        var El = Byid(idMet);
        var hx = (x2-x1)/1000;
        var hy = (y2 - y1)/1000;
        var T = [0,0];
        if(j != 0)
          T = GetTransform(El);
          hx += T[0];
          hy += T[1];
        El.setAttribute('transform','translate('+hx+','+hy+')');
        j +=1;
      }

      function F()
      {
        var El = Byid('MF'+clas);
        El.setAttribute('transform','translate('+0+','+0+')');
        j =0;
        newLineT(Speed,xf1,yf1,xf2,yf2,clas);
      }

    }


  }

  Byid('GroupBTN3_Stop').onclick = function()
  {
    RunTime = false;
  }


  function showFile(input) 
  {
      let file = input.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      
      
      reader.onload = function()
          {
              var result = reader.result.split('&');
              AllElement = JSON.parse(result[0]);
              Links = JSON.parse(result[1]);
              OptionsCircle.count = +result[2];
              OptionsRect.count = +result[3];
              LinkCount = +result[4];
              Tempmatrix = JSON.parse(result[5])
            matrix.a = Tempmatrix.a;
            matrix.b = Tempmatrix.b;
            matrix.c = Tempmatrix.c;
            matrix.d = Tempmatrix.d;
            matrix.e = Tempmatrix.e;
            matrix.f = Tempmatrix.f;
            matrix.m11 = Tempmatrix.m11;
            matrix.m12 = Tempmatrix.m12;
            matrix.m13 = Tempmatrix.m13;
            matrix.m14 = Tempmatrix.m14;
            matrix.m21 = Tempmatrix.m21;
            matrix.m22 = Tempmatrix.m22;
            matrix.m23 = Tempmatrix.m23;
            matrix.m24 = Tempmatrix.m24;
            matrix.m31 = Tempmatrix.m31;
            matrix.m32 = Tempmatrix.m32;
            matrix.m33 = Tempmatrix.m33;
            matrix.m34 = Tempmatrix.m34;
            matrix.m41 = Tempmatrix.m41;
            matrix.m42 = Tempmatrix.m42;
            matrix.m43 = Tempmatrix.m43;
            matrix.m44 = Tempmatrix.m44;
              Byid('general_group').innerHTML = result[6];
          }  
      
      reader.onerror = function() 
          {
              console.log(reader.error);
          };
  }

  Byid('SaveFile').onclick = function()
  {
    var GeneralSTR = JSON.stringify(AllElement) + '\n' + '&';
    GeneralSTR += JSON.stringify(Links) + '\n' + '&';
    GeneralSTR += OptionsCircle.count + '\n' + '&';
    GeneralSTR += OptionsRect.count + '\n' + '&';
    GeneralSTR += LinkCount+ '\n' + '&';
    GeneralSTR += JSON.stringify(matrix) + '\n' + '&';
    GeneralSTR += Byid('general_group2').outerHTML;
    Save(GeneralSTR)
    function Save(str)
    {
      var a = document.createElement("a");
      Byid('alink').innerHTML = a;
      a.style = "display: none";
      var blob = new Blob([str],{type:"text/plain"});
      var url = window.URL.createObjectURL(blob);
      a.href= url;
      var name = prompt('Введите имя файла','Модель сети Петри');
      a.download = name+'.txt';
      a.id = "adw";
      a.click();
      window.URL.revokeObjectURL(url);
    }

  }

Byid('settingsSpeedText').onclick = function()
{
  var sel = Byid('GroupSpeed');

  if(sel.style.display == 'none')
  {
    sel.style.display = 'block';
  }else
  {
    sel.style.display = 'none';
  }
}

Byid('btnSpeed').onclick = function()
{
  for(key in SpeedM)
  SpeedM[key] = +(Byid('in'+key).value)
}

function SetNewSpeedLink(id)
{
  var n;
  var f = false;
  for(key in SpeedM)
  {
    n = prompt('Введите время прохождения дуги(ms)'+'\n' + 'Для ' + (+key + 1) +' проекта' ,Links['Link'+id].Speed[key]);
    if(!n){return}
    if(n == 'delete')
    {
      f= true;
      break;
    }
    Links['Link'+id].Speed[key] = +n;
  }
  if(f)
  {
    AllElement[Links['Link'+id].Final]['Link'+id]['Type'] = 'delete';
    return;
  }
  if(AllElement[Links['Link'+id].Final]['Link'+id]['Type'] == 'delete')
  {
    AllElement[Links['Link'+id].Final]['Link'+id]['Type'] = 'get';
    AllElement[Links['Link'+id].Start]['Link'+id]['Type'] = 'set';
    AllElement[Links['Link'+id].Start].style.fill = 'green';
  }
}


  