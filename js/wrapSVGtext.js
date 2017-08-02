var NS="http://www.w3.org/2000/svg"
     //---onload and button---
window.wrapTextRect = function (myRect, myText, str, offset)
{
    if (!offset) offset = 0;
    //---clear previous---
    $(myText).html('')

    var padding=0
    var width=+$(myRect).attr('width') - padding
    var x=+$(myRect).attr('x')
    var y=+$(myRect).attr('y') + offset
    var maxY = Number($(myRect).attr('y')) + Number($(myRect).attr('height'))




    // var fontSize=+Number(myText.getAttribute("font-size"))
    var fontSize = Number($(myText).attr('font-size'));
    // console.log(myText)
    // var fontSize = 14;
    var lineHeight = 1.4;

    var maxHeight = Number($(myRect).attr('height')) - offset;
    var maxLines = Math.floor(maxHeight / ( fontSize * lineHeight ));
    // console.log('maxLines', maxLines);


    var text=str

    var words = text.split(' ');
    var text_element = myText;
    var tspan_element = document.createElementNS(NS, "tspan");   // Create first tspan element
    var text_node = document.createTextNode(words[0]);           // Create text in tspan element

    x = !!x ? x : 0;
    y = !!y ? y : 0;

    tspan_element.setAttribute("x", x+padding);
    tspan_element.setAttribute("y", y+padding+fontSize);
    tspan_element.appendChild(text_node);                           // Add tspan element to DOM
    $(text_element).append(tspan_element);                        // Add text to tspan element

    for(var i=1; i<words.length; i++)
    {
        var len = tspan_element.firstChild.data.length            // Find number of letters in string
        tspan_element.firstChild.data += " " + words[i];            // Add next word

        if (tspan_element.getComputedTextLength() > width-padding)
        {
            
            tspan_element.firstChild.data = tspan_element.firstChild.data.slice(0, len);    // Remove added word

            if ( myText.children('tspan').length === maxLines  ) {
                myText.children('tspan').last().append('...')
                return;
            }


            var tspan_element = document.createElementNS(NS, "tspan");       // Create new tspan element
            tspan_element.setAttribute("x",  x+padding);
            tspan_element.setAttribute("dy", fontSize * lineHeight);
            text_node = document.createTextNode(words[i]);
            tspan_element.appendChild(text_node);
            $(text_element).append(tspan_element);
        }
    }

    // var height = text_element.getBBox().height +2*padding; //-- get height plus padding
    // myRect.setAttribute('height', height); //-- change rect height
    // showSourceSVG()
}