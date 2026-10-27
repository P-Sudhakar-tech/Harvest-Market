import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.farmer.deleteMany();

  const farmers = await Promise.all([
    db.farmer.create({data:{name:"Lakshmi Reddy",farmName:"Sunrise Organics",location:"Shamirpet, Telangana",description:"Seasonal vegetables grown with care on a small family farm.",verified:true}}),
    db.farmer.create({data:{name:"Ravi Kumar",farmName:"Green Basket Farm",location:"Medchal, Telangana",description:"Fresh greens and everyday vegetables harvested to order.",verified:true}}),
    db.farmer.create({data:{name:"Anita Devi",farmName:"Golden Grain Collective",location:"Vikarabad, Telangana",description:"Local grains and pantry staples sourced from nearby growers.",verified:true}})
  ]);
  const products = [
    ["Tomatoes","Juicy, sun-ripened tomatoes from this week's harvest.","Vegetables",450,"kg","https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85",35,true,0],
    ["Spinach","Tender leafy greens, harvested fresh in the morning.","Leafy greens",300,"bunch","https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=85",22,true,1],
    ["Carrots","Sweet, crunchy carrots grown in healthy soil.","Vegetables",600,"kg","https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=85",18,false,0],
    ["Red Apples","Crisp apples for lunchboxes and afternoon snacks.","Fruits",18000,"kg","https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=85",15,true,1],
    ["Fresh Cucumbers","Cool and crisp cucumbers for salads and raita.","Vegetables",350,"kg","https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=900&q=85",28,false,0],
    ["Farm Millet","Everyday local millet from regional growers.","Grains",9500,"kg","https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=85",40,true,2]
  ] as const;
  for (const p of products) {
    await db.product.create({data:{name:p[0],description:p[1],category:p[2],pricePaise:p[3],unit:p[4],image:p[5],stock:p[6],featured:p[7],farmerId:farmers[p[8]].id}});
  }
}
main().finally(()=>db.$disconnect());
