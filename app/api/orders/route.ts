import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const orderSchema = z.object({
  customerName:z.string().trim().min(2).max(100),
  email:z.string().trim().email().max(254),
  phone:z.string().trim().min(10).max(20),
  address:z.string().trim().min(5).max(500),
  deliveryPinCode:z.string().regex(/^[0-9]{6}$/),
  notes:z.string().max(500).optional(),
  items:z.array(z.object({productId:z.string().min(1),quantity:z.number().int().min(1).max(50)})).min(1).max(50)
});

export async function POST(request: Request) {
  let parsed;
  try { parsed = orderSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({error:"Invalid JSON body"}, {status:400}); }
  if (!parsed.success) return NextResponse.json({error:"Please check your details and basket."},{status:400});

  try {
    const result = await db.$transaction(async tx => {
      const ids = [...new Set(parsed.data.items.map(i=>i.productId))];
      const products = await tx.product.findMany({where:{id:{in:ids},active:true}});
      if(products.length!==ids.length) throw new Error("One or more products are unavailable.");
      const lines = parsed.data.items.map(item=>{
        const p=products.find(x=>x.id===item.productId)!;
        if(item.quantity>p.stock) throw new Error(`${p.name} has only ${p.stock} available.`);
        return {productId:p.id,productName:p.name,quantity:item.quantity,unitPricePaise:p.pricePaise,lineTotal:p.pricePaise*item.quantity};
      });
      const subtotalPaise=lines.reduce((sum,l)=>sum+l.lineTotal,0);
      const deliveryPaise=0; // Configure delivery pricing before production.
      const order=await tx.order.create({data:{
        customerName:parsed.data.customerName,email:parsed.data.email,phone:parsed.data.phone,
        address:parsed.data.address,deliveryPinCode:parsed.data.deliveryPinCode,notes:parsed.data.notes,
        subtotalPaise,deliveryPaise,totalPaise:subtotalPaise,status:"PENDING_PAYMENT",
        items:{create:lines.map(({lineTotal,...line})=>line)}
      }});
      for(const line of lines) {
        const changed=await tx.product.updateMany({where:{id:line.productId,stock:{gte:line.quantity}},data:{stock:{decrement:line.quantity}}});
        if(changed.count!==1) throw new Error(`${line.productName} just went out of stock. Please retry.`);
      }
      return order;
    });
    return NextResponse.json({orderId:result.id,status:result.status,totalPaise:result.totalPaise},{status:201});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Could not create order."},{status:409});
  }
}