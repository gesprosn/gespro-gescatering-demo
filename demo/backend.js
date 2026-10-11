import{PGlite as Re}from"@electric-sql/pglite";import{pgcrypto as Le}from"@electric-sql/pglite/contrib/pgcrypto";async function re(r,c){for(let l of c)try{await r.exec(l.sql)}catch(h){throw new Error(`\xC9chec de ${l.name} : ${h.message}`)}}function ie(r){for(let c of["query","exec"]){let l=r[c].bind(r);r[c]=(...h)=>r.__gcInTransaction?Promise.reject(new Error(`db.${c}() appel\xE9 pendant une transaction asUser : utiliser \`tx\`, ou sortir l'appel de la transaction.`)):l(...h)}return r}async function E(r,c,l){r.__gcInTransaction=!0;try{return await r.transaction(async h=>(await h.query("select set_config('request.jwt.claim.sub', $1, true)",[c]),await h.query("select set_config('request.jwt.claim.role', 'authenticated', true)"),await h.exec("set local role authenticated"),l(h)))}finally{r.__gcInTransaction=!1}}var K=[{name:"Grossiste Dakar (d\xE9mo)",contact:"M. Ndiaye",phone:"+221 70 000 00 01",lead:3,categories:["Produits secs","Condiments"]},{name:"Mara\xEEchers des Niayes (d\xE9mo)",contact:"Mme Sarr",phone:"+221 70 000 00 02",lead:1,categories:["Fruits et l\xE9gumes"]},{name:"Boucherie Centrale (d\xE9mo)",contact:"M. Diop",phone:"+221 70 000 00 03",lead:2,categories:["Froid - viandes et poissons"]},{name:"Hygi\xE8ne Services Plus (d\xE9mo)",contact:"Mme Fall",phone:"+221 70 000 00 04",lead:5,categories:["Produits d'entretien"]},{name:"Emballages du Cap-Vert (d\xE9mo)",contact:"M. Ba",phone:"+221 70 000 00 05",lead:4,categories:["Consommables"]},{name:"Import Alimentaire Ouest (d\xE9mo)",contact:"M. Kane",phone:"+221 70 000 00 06",lead:7,categories:[]}],we={"Produits secs":900,Condiments:1500,"Fruits et l\xE9gumes":700,"Froid - viandes et poissons":4200,"Produits d'entretien":1800,Consommables:350},ae=["fastfood@demo.local","patisserie@demo.local","petitdej@demo.local","cuisine@demo.local"],ze=["Casse \xE0 la manutention","Produit p\xE9rim\xE9","\xC9cart d'inventaire","Ab\xEEm\xE9 \xE0 la livraison"];function $e(r){let c=r>>>0;return()=>{c=c+1831565813>>>0;let l=c;return l=Math.imul(l^l>>>15,l|1),l^=l+Math.imul(l^l>>>7,l|61),((l^l>>>14)>>>0)/4294967296}}async function oe(r,{org:c,site:l,users:h,departments:C}){let g=$e(20261011),v=e=>e[Math.floor(g()*e.length)],y=(e,n)=>E(r,h[e].id,n),f=async(e,n,i)=>(await e.query(n,i)).rows[0],x=async(e,n,i)=>y(e,async o=>(await o.query(n,i)).rows[0]),w="admin@demo.local",z="direction@demo.local",$="magasin@demo.local",s="achats@demo.local",m=0,_=e=>`demo-${e}-${++m}`,a=async()=>(await r.query("select clock_timestamp() as t")).rows[0].t,d=async(e,n,i=[])=>{await r.query("set session_replication_role = replica");try{for(let[o,u]of[["stock_movements","created_at"],["stock_reservations","created_at"],["receipts","received_at"],["supply_requests","created_at"]])await r.query(`update public.${o} set ${u} = $2 where organization_id = $3 and ${u} >= $1`,[e,n,c]);for(let[o,u]of i)await r.query(o,u)}finally{await r.query("set session_replication_role = origin")}},t=(e,n=9,i=0)=>{let o=new Date;return o.setDate(o.getDate()-e),o.setHours(n,i,0,0),o},b=e=>e.toISOString().slice(0,10),p=(await r.query(`select p.id, p.reference, p.name, p.stock_unit_id, c.name as category, coalesce(p.min_stock, 0) as min_stock
       from public.products p left join public.product_categories c on c.id = p.category_id
      where p.organization_id = $1 order by p.reference`,[c])).rows,S=async()=>new Map((await r.query("select product_id, on_hand - reserved as available from public.stock_levels where site_id = $1",[l])).rows.map(e=>[e.product_id,Number(e.available)])),P={},R=new Map,j=new Map;await y(w,async e=>{for(let n of K){let i=await f(e,"select id from public.suppliers where organization_id = $1 and name = $2",[c,n.name]);P[n.name]=i?(await f(e,"update public.suppliers set contact_name = $2, phone = $3 where id = $1 returning id",[i.id,n.contact,n.phone])).id:(await f(e,`insert into public.suppliers (organization_id, name, contact_name, phone)
                          values ($1, $2, $3, $4) returning id`,[c,n.name,n.contact,n.phone])).id}for(let n of p){let i=K.find(q=>q.categories.includes(n.category))??K[0],o=we[n.category]??1e3,u=Math.round(o*(.5+g()*1.5)/25)*25;R.set(n.id,u),j.set(n.id,i.name),await e.query(`insert into public.supplier_products (organization_id, supplier_id, product_id, unit_id, unit_price,
                                               lead_time_days, is_preferred, price_updated_at)
         values ($1, $2, $3, $4, $5, $6, true, now())`,[c,P[i.name],n.id,n.stock_unit_id,u,i.lead]),g()<.25&&await e.query(`insert into public.supplier_products (organization_id, supplier_id, product_id, unit_id, unit_price,
                                                 lead_time_days, is_preferred, price_updated_at)
           values ($1, $2, $3, $4, $5, 7, false, now())`,[c,P["Import Alimentaire Ouest (d\xE9mo)"],n.id,n.stock_unit_id,Math.round(u*1.12/25)*25])}});let G=async(e,n,{urgency:i="normal",slot:o=null,comment:u=null}={})=>y(e,async q=>{let A=C[h[e].department],J=await f(q,`insert into public.requests (department_id, site_id, urgency, needed_slot, comment)
         values ($1, $2, $3, $4, $5) returning id, reference`,[A,l,i,o,u]);for(let te of n)await q.query("insert into public.request_lines (request_id, product_id, quantity) values ($1, $2, $3)",[J.id,te.product.id,te.quantity]);return await q.query("select public.submit_request($1)",[J.id]),J}),Q=e=>x(z,"select public.approve_request($1, true)",[e]),ve=(e,n)=>x(z,"select public.approve_request($1, false, $2)",[e,n]),W=(e,n=1)=>y($,async i=>{let o=(await i.query("select line_id, reserved from public.v_request_lines where request_id = $1",[e])).rows.filter(u=>Number(u.reserved)>0).map(u=>({line_id:u.line_id,quantity:n===1?Number(u.reserved):Math.max(1,Math.floor(Number(u.reserved)*n))}));return o.length?(await i.query("select public.serve_request($1, $2, $3) as s",[e,JSON.stringify(o),_("serve")])).rows[0].s:null}),Z=(e,n,{approved:i,served:o,neededOn:u,slot:q}={})=>[`update public.requests set created_at = $2::timestamptz, submitted_at = $2::timestamptz,
            updated_at = coalesce($4::timestamptz, $3::timestamptz, $2::timestamptz),
            approved_at = case when approved_at is null then null else $3::timestamptz end,
            served_at = case when served_at is null then null else $4::timestamptz end,
            needed_on = $5::date
      where id = $1`,[e,n,i??n,o??null,u??b(n)]],N=async(e,n,{notes:i=null}={})=>y(s,async o=>{let u=await f(o,`insert into public.purchase_orders (supplier_id, site_id, notes)
                              values ($1, $2, $3) returning id, reference`,[P[e],l,i]);for(let q of n)await o.query(`insert into public.purchase_order_lines (purchase_order_id, product_id, quantity, unit_price)
                      values ($1, $2, $3, $4)`,[u.id,q.product.id,q.quantity,R.get(q.product.id)]);return u}),U=e=>x(s,"select public.submit_purchase_order($1)",[e]),M=e=>x(z,"select public.approve_purchase_order($1, true)",[e]),V=(e,n)=>x(s,"select public.mark_purchase_order_ordered($1, $2)",[e,n]),ee=(e,n=1,i=null)=>y($,async o=>{let u=(await o.query("select id, quantity_stock - received_quantity as rest from public.purchase_order_lines where purchase_order_id = $1",[e])).rows.map(q=>({line_id:q.id,quantity:n===1?Number(q.rest):Math.max(1,Math.floor(Number(q.rest)*n))}));return(await o.query("select public.receive_purchase_order($1, $2, $3, $4)",[e,JSON.stringify(u),_("receipt"),i])).rows[0]}),O=(e,n,{approved:i,ordered:o,expected:u})=>[`update public.purchase_orders set created_at = $2::timestamptz, submitted_at = $2::timestamptz,
            updated_at = coalesce($4::timestamptz, $3::timestamptz, $2::timestamptz),
            approved_at = case when approved_at is null then null else $3::timestamptz end,
            ordered_at = case when ordered_at is null then null else $4::timestamptz end,
            expected_date = coalesce($5::date, expected_date)
      where id = $1`,[e,n,i??n,o??null,u??null]],he=async e=>{let n=await S();return p.filter(i=>(n.get(i.id)??0)>=e)},B=async(e,n)=>{let i=await he(n),o=new Map;for(;o.size<Math.min(e,i.length);){let u=v(i);o.set(u.id,{product:u,quantity:1+Math.floor(g()*n)})}return[...o.values()]},be=e=>{let n=new Map;for(let i of e){let o=j.get(i.product.id);n.set(o,[...n.get(o)??[],i])}return n};await d(new Date(0),t(15,7));let I={requests:0,orders:0,losses:0};for(let e=14;e>=1;e--){if(e%3===2){let n=p.filter(o=>o.category!=="Consommables"),i=[];for(let o=0;o<4+Math.floor(g()*4);o++){let u=v(n);i.some(q=>q.product.id===u.id)||i.push({product:u,quantity:10+Math.floor(g()*30)})}for(let[o,u]of be(i)){let q=await a(),A=await N(o,u);await U(A.id),await M(A.id),await V(A.id,b(t(e))),await ee(A.id,1,`BL-${1e3+e*7+I.orders}`),await d(q,t(e,8,30),[O(A.id,t(e+2,10),{approved:t(e+2,15),ordered:t(e+1,9),expected:b(t(e))})]),I.orders++}}for(let n of ae){if(g()<.3)continue;let i=await B(2+Math.floor(g()*3),4);if(!i.length)continue;let o=await a(),u=v(["morning","noon","evening"]),q=await G(n,i,{slot:u,urgency:g()<.1?"urgent":"normal"});await Q(q.id),await W(q.id),await d(o,t(e,10,15),[Z(q.id,t(e+1,16),{approved:t(e,8),served:t(e,10,15),neededOn:b(t(e)),slot:u})]),I.requests++}if(e===9||e===4){let n=await B(2,3),i=await a(),o=await G(v(ae),n);await ve(o.id,e===9?"Doublon avec la demande de la veille":"Quantit\xE9 trop \xE9lev\xE9e pour un samedi"),await d(i,t(e,9),[Z(o.id,t(e+1,17),{approved:t(e,9),neededOn:b(t(e))})])}if(e%4===0){let[n]=await B(1,2);if(n){let i=await a();await x($,"select public.record_stock_movement($1, $2, 'adjustment_out', $3, null, $4, $5)",[l,n.product.id,n.quantity,v(ze),_("loss")]),await d(i,t(e,18)),I.losses++}}}let ye=p.filter(e=>e.category==="Fruits et l\xE9gumes"),ke=p.filter(e=>e.category==="Froid - viandes et poissons"),H=p.filter(e=>e.category==="Produits secs"),qe=p.filter(e=>e.category==="Produits d'entretien"),F=(e,n,i)=>e.slice(0,n).map((o,u)=>({product:o,quantity:i+u*5})),L=await a(),k=await N("Grossiste Dakar (d\xE9mo)",F(H.slice(10),4,20));await U(k.id),await M(k.id),await V(k.id,b(t(2))),await ee(k.id,.5,"BL-2291"),await d(L,t(1,11),[O(k.id,t(5,10),{approved:t(5,14),ordered:t(4,9),expected:b(t(2))})]),L=await a(),k=await N("Boucherie Centrale (d\xE9mo)",F(ke,3,15)),await U(k.id),await M(k.id),await V(k.id,b(t(1))),await d(L,t(3,9),[O(k.id,t(3,9),{approved:t(3,11),ordered:t(3,12),expected:b(t(1))})]),L=await a(),k=await N("Mara\xEEchers des Niayes (d\xE9mo)",F(ye.slice(3),5,10)),await U(k.id),await M(k.id),await V(k.id,b(t(-2))),await d(L,t(1,9),[O(k.id,t(1,9),{approved:t(1,10),ordered:t(1,11),expected:b(t(-2))})]),L=await a(),k=await N("Hygi\xE8ne Services Plus (d\xE9mo)",F(qe,3,6),{notes:"Livrer avant la prestation de vendredi"}),await U(k.id),await M(k.id),await d(L,t(0,8),[O(k.id,t(1,15),{approved:t(0,8)})]),L=await a(),k=await N("Emballages du Cap-Vert (d\xE9mo)",F(p.filter(e=>e.category==="Consommables"),4,50)),await U(k.id),await d(L,t(0,8,30),[O(k.id,t(0,8,30),{})]),I.orders+=5;let xe=[["fastfood@demo.local","submitted",{urgency:"urgent",slot:"noon",comment:"Rush du midi : 200 couverts"}],["patisserie@demo.local","submitted",{slot:"morning"}],["petitdej@demo.local","submitted",{slot:"morning"}],["cuisine@demo.local","approved",{slot:"noon"}],["fastfood@demo.local","approved",{slot:"evening"}],["patisserie@demo.local","partial",{slot:"noon"}]];for(let[e,n,i]of xe){let o=await B(2+Math.floor(g()*3),5),u=await G(e,o,i);n!=="submitted"&&await Q(u.id),n==="partial"&&await W(u.id,.5),I.requests++}{let e=await S(),n=H.find(o=>(e.get(o.id)??0)>0&&(e.get(o.id)??0)<30)??H[0],i=await G("cuisine@demo.local",[{product:n,quantity:Math.ceil((e.get(n.id)??0)+15)}],{slot:"noon",comment:"Prestation sp\xE9ciale : mariage de samedi"});await Q(i.id)}let ne=(await y($,e=>e.query("select product_id, to_order from public.v_supply_needs where site_id = $1 and to_order > 0 order by product_name",[l]))).rows.slice(0,5);ne.length&&await x($,"select public.transmit_supply_needs($1, $2, $3)",[l,JSON.stringify(ne.map(e=>({product_id:e.product_id,quantity:Number(e.to_order)}))),"Point stock du matin"]);let Y=(await y(s,e=>e.query("select line_id, product_id from public.v_open_supply_needs order by product_name"))).rows;if(Y.length>=2){let e=Y[0],n=Y.filter(i=>j.get(i.product_id)===j.get(e.product_id)).slice(0,2);await x(s,"select public.create_purchase_order_from_needs($1, $2)",[n.map(i=>i.line_id),P[j.get(e.product_id)]]),I.orders++}return I}var Ee={"Riz parfume pithibi":18e3,"Oignon locale":11e3,"Pomme de terre":11e3,"Viande locale":4800,"Pate d'arachide":1200,Carotte:1200,Patate:500,"Poivron vert":1800,Yet:4e3,"Netetou en poudre":2e3,Soja:1300,"Piment gouana sofia":5e3,"Poulet blanc":3e3,"Citron vert":1500,Laurier:3e3,Moutarde:9e3,Spaguetty:1e3,"Viande hachee":5e3,"Tomate fraiche":800,"Herbe de province":6e3,"Epice paprika":5e3},Se=["Riz parfume pithibi","Oignon locale","Pomme de terre"],se=[{name:"Maff\xE9 Yapp",category:"Plat chaud",portions:1,sale:2500,target:35,validate:!1,notes:"Relev\xE9 de la fiche SESA du 19/09 (vid\xE9o du 11/10). \xC0 compl\xE9ter : huile, Maggi, poivre moulu et sel fin sont absents du catalogue ; tomate concentr\xE9e, ail, oignon vert, amora et vinaigre attendent le contenu de leur conditionnement. Food cost \xE0 surveiller : la viande seule p\xE8se plus de 80 % du budget mati\xE8re.",steps:`1. Couper la viande en morceaux, assaisonner (ail, poivre, Maggi).
2. Faire revenir dans l'huile, ajouter l'oignon et la tomate concentr\xE9e.
3. D\xE9layer la p\xE2te d'arachide, mouiller, laisser mijoter 45 min.
4. Ajouter carotte, patate douce, pomme de terre ; cuire 20 min.
5. Rectifier (yett, n\xE9t\xE9tou, piment).
6. Servir avec le riz cuit \xE0 part.`,lines:[["Viande locale",.15,"kg"],["Riz parfume pithibi",.15,"kg"],["Pate d'arachide",.02,"kg"],["Tomate concentree",.01,"kg"],["Oignon locale",.005,"kg"],["Patate",.015,"kg"],["Pomme de terre",.015,"kg"],["Carotte",.015,"kg"],["Ail",.004,"kg"],["Oignon vert",.01,"kg"],["Poivron vert",.01,"kg"],["Piment gouana sofia",.001,"kg"],["Yet",.001,"kg"],["Netetou en poudre",.001,"kg"],["Soja",.001,"bouteille"],["Amora",.001,"bouteille"],["Vinaigre",.001,"l"]]},{name:"Yassa poulet",category:"Plat chaud",portions:10,sale:2600,target:35,validate:!0,notes:"Fiche de d\xE9monstration.",steps:`1. Mariner le poulet (citron, oignon \xE9minc\xE9, moutarde, piment) la veille.
2. Griller le poulet.
3. Confire l'oignon dans la marinade 30 min, ajouter le laurier.
4. Remettre le poulet, mijoter 15 min.
5. Servir avec le riz.`,lines:[["Poulet blanc",2,"kg"],["Oignon locale",1.5,"kg"],["Citron vert",300,"g"],["Riz parfume pithibi",1.5,"kg"],["Piment gouana sofia",50,"g"],["Laurier",10,"g"],["Poivron vert",200,"g"]]},{name:"Spaghetti bolognaise",category:"Plat chaud",portions:10,sale:2500,target:30,validate:!0,notes:"Fiche de d\xE9monstration.",steps:`1. Faire revenir la viande hach\xE9e.
2. Ajouter carotte et tomate concass\xE9e, les herbes et le paprika ; mijoter 30 min.
3. Cuire les spaghetti al dente.
4. Napper de sauce au service.`,lines:[["Spaguetty",1.2,"kg"],["Viande hachee",1,"kg"],["Tomate fraiche",800,"g"],["Carotte",300,"g"],["Herbe de province",10,"g"],["Epice paprika",10,"g"]]}];async function le(r,{org:c,users:l}){let h=l["admin@demo.local"].id,C=l["cuisine@demo.local"].id,g=l["direction@demo.local"].id,v=new Map((await r.query("select id, name from public.products where organization_id = $1",[c])).rows.map(s=>[s.name,s.id])),y=new Map((await r.query("select id, code from public.units where organization_id is null or organization_id = $1",[c])).rows.map(s=>[s.code,s.id])),f=s=>{let m=v.get(s);if(!m)throw new Error(`Produit de d\xE9monstration introuvable au catalogue : ${s}`);return m};await E(r,h,async s=>{for(let[m,_]of Object.entries(Ee))await s.query("update public.supplier_products set unit_price = $2 where product_id = $1 and is_preferred",[f(m),_]);for(let m of Se)await s.query(`insert into public.product_unit_conversions (product_id, unit_id, factor, is_validated)
         values ($1, $2, 0.04, true) on conflict (product_id, unit_id) do nothing`,[f(m),y.get("kg")])});let x=l["magasin@demo.local"].id,w=(await r.query("select id from public.sites where organization_id = $1 limit 1",[c])).rows[0].id,z=[...new Set(se.flatMap(s=>s.lines.map(([m])=>m)))];await E(r,x,async s=>{for(let m of z){let{rows:[_]}=await s.query(`select p.id, u.dimension, coalesce(l.on_hand - l.reserved, 0) as available
           from public.products p join public.units u on u.id = p.stock_unit_id
           left join public.stock_levels l on l.product_id = p.id and l.site_id = $2
          where p.id = $1`,[f(m),w]);Number(_.available)>0||await s.query("select public.record_stock_movement($1, $2, 'receipt', $3, null, 'R\xE9approvisionnement (d\xE9mo)', $4)",[w,_.id,_.dimension==="package"?4:15,`demo-recipe-stock-${_.id}`])}});let $=0;for(let s of se){let m=await E(r,C,async _=>{let{id:a}=(await _.query(`insert into public.recipes (name, category, portions, sale_price, target_food_cost_pct, steps, notes)
         values ($1, $2, $3, $4, $5, $6, $7) returning id`,[s.name,s.category,s.portions,s.sale,s.target,s.steps,s.notes])).rows[0],d=0;for(let[t,b,p]of s.lines)await _.query("insert into public.recipe_lines (recipe_id, product_id, quantity, unit_id, position) values ($1, $2, $3, $4, $5)",[a,f(t),b,y.get(p),d++]);return a});s.validate&&await E(r,g,_=>_.query("select public.validate_recipe($1)",[m])),$++}return $}var T=[{email:"admin@demo.local",id:"10000000-0000-0000-0000-000000000001",role:"owner",label:"Administrateur",icon:"admin"},{email:"direction@demo.local",id:"10000000-0000-0000-0000-000000000002",role:"ops_director",label:"Production",icon:"director"},{email:"magasin@demo.local",id:"10000000-0000-0000-0000-000000000003",role:"storekeeper",label:"Stock",icon:"store"},{email:"achats@demo.local",id:"10000000-0000-0000-0000-000000000004",role:"purchasing",label:"Achats",icon:"purchase"},{email:"cuisine@demo.local",id:"10000000-0000-0000-0000-000000000005",role:"kitchen",label:"Cuisine centrale",icon:"kitchen",department:"Cuisine centrale"},{email:"fastfood@demo.local",id:"10000000-0000-0000-0000-000000000006",role:"requester",label:"Service Fast food",icon:"service",department:"Fast food"},{email:"patisserie@demo.local",id:"10000000-0000-0000-0000-000000000007",role:"requester",label:"Service P\xE2tisserie",icon:"service",department:"P\xE2tisserie"},{email:"petitdej@demo.local",id:"10000000-0000-0000-0000-000000000008",role:"requester",label:"Service Petit d\xE9jeuner",icon:"service",department:"Petit d\xE9jeuner"}],Ce=["Fast food","P\xE2tisserie","Petit d\xE9jeuner","Cuisine centrale"];function ue(r){let c=2166136261;for(let l of r)c=Math.imul(c^l.charCodeAt(0),16777619);return(c>>>0)/4294967295}async function ce(r,{rows:c,history:l=!0}){let h=async(a,d)=>(await r.query(a,d)).rows[0],C=T[0];for(let a of T)await r.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)",[a.id,a.email,{full_name:a.label}]);let{org:g}=await h("select platform.provision_organization($1, 'gescatering', 'SESA Catering (d\xE9mo)') as org",[C.id]);await r.query("select public.init_catering_organization($1)",[g]);let v=async a=>(await h("select id from platform.roles where is_system and key = $1",[a])).id,y=(await h("select id from public.sites where organization_id = $1",[g])).id,f={};for(let a of Ce)f[a]=(await h("insert into public.departments (organization_id, site_id, name) values ($1, $2, $3) returning id",[g,y,a])).id;for(let a of T.slice(1)){let{id:d}=await h(`insert into platform.memberships (user_id, organization_id, role_id, status, joined_at)
       values ($1, $2, $3, 'active', now()) returning id`,[a.id,g,await v(a.role)]);a.department&&await r.query("insert into platform.membership_scopes (membership_id, scope_type, scope_id) values ($1, 'department', $2)",[d,f[a.department]])}let x=await E(r,C.id,async a=>{let d=(await a.query("select public.stage_catalog_import($1, 'revue-demo.xlsx', $2) as id",[g,JSON.stringify(c)])).rows[0].id;return(await a.query("select public.confirm_catalog_import($1) as r",[d])).rows[0].r}),w=(await r.query("select id, reference from public.products where organization_id = $1 order by reference",[g])).rows,z=T.find(a=>a.role==="storekeeper"),$=0;await E(r,C.id,async a=>{for(let d of w){let t=ue(d.reference);t<.5&&await a.query("update public.products set min_stock = $2 where id = $1",[d.id,Math.ceil(t*20)+2])}}),await E(r,z.id,async a=>{for(let d of w){let t=ue(d.reference+":stock");t<.7&&(await a.query("select public.record_stock_movement($1, $2, 'receipt', $3, null, 'Stock initial (d\xE9mo)', $4)",[y,d.id,Math.ceil(t*60),`demo-init-${d.reference}`]),$++)}}),await r.query("insert into public.suppliers (organization_id, name, phone) values ($1, 'Grossiste Dakar (d\xE9mo)', '+221 00 000 00 00')",[g]);let s=Object.fromEntries(T.map(a=>[a.email,a])),m=l?await oe(r,{org:g,site:y,users:s,departments:f}):null,_=l?await le(r,{org:g,users:s}):0;return{org:g,site:y,departments:f,imported:x,stocked:$,products:w.length,activity:m,recipes:_}}var Pe=new Set(["requests","request_lines","v_request_lines","v_request_consolidation","v_stock_position","v_supply_needs","products","product_categories","departments","sites","units","supply_request_lines","supply_requests","purchase_orders","purchase_order_lines","suppliers","catering_settings","stock_movements","v_open_supply_needs","v_purchase_orders","v_purchase_order_lines","receipts","supplier_products","recipes","recipe_lines","v_recipes","v_recipe_lines","product_unit_conversions","v_recipe_templates","recipe_ingredient_products"]),de=new Set(["requests","request_lines","purchase_orders","purchase_order_lines","recipes","recipe_lines"]),D=/^[a-z_][a-z0-9_]*$/,pe={eq:"=",neq:"<>",gt:">",gte:">=",lt:"<",lte:"<="};function _e(r){let c=new Map(T.map(v=>[v.email,v])),l=new Map;async function h(v){if(!l.has(v)){let y=await r.query(`select a.name, format_type(a.type, null) as type
           from pg_proc p, unnest(p.proargnames, p.proargtypes::oid[]) with ordinality as a(name, type, n)
          where p.pronamespace = 'public'::regnamespace and p.proname = $1`,[v]);l.set(v,new Map(y.rows.map(f=>[f.name,f.type])))}return l.get(v)}async function C({method:v,path:y,body:f={},user:x}){let w=new URL(y,"http://demo.local/"),z=w.pathname.split("/").filter(Boolean);if(z[0]==="users"&&v==="GET")return{status:200,body:T.map(({id:m,..._})=>_)};let $=c.get(x);if(!$)return{status:401,body:{message:"Choisir un compte de d\xE9monstration."}};let s=z[1];if(!s||!D.test(s))return{status:400,body:{message:"Nom invalide"}};if(z[0]==="from"&&v==="GET"){if(!Pe.has(s))return{status:403,body:{message:"Relation non expos\xE9e"}};let m=[],_=[],a="",d=500;for(let[p,S]of w.searchParams)if(p==="order"){let[P,R]=S.split(".");if(!D.test(P))return{status:400,body:{message:"Tri invalide"}};a=` order by ${P} ${R==="desc"?"desc":"asc"}`}else if(p==="limit")d=Math.min(Number(S)||500,1e3);else{if(!D.test(p))return{status:400,body:{message:"Filtre invalide"}};let P=S.indexOf("."),R=S.slice(0,P),j=S.slice(P+1);if(R==="in")_.push(j.replace(/^\(|\)$/g,"").split(",").filter(Boolean)),m.push(`${p}::text = any($${_.length}::text[])`);else if(pe[R])_.push(j),m.push(`${p}::text ${pe[R]} $${_.length}`);else return{status:400,body:{message:`Op\xE9rateur inconnu : ${R}`}}}let t=`select * from public.${s}${m.length?" where "+m.join(" and "):""}${a} limit ${d}`;return{status:200,body:await E(r,$.id,async p=>(await p.query(t,_)).rows)}}if(z[0]==="insert"&&v==="POST")return de.has(s)?{status:201,body:await E(r,$.id,async _=>{let a=[];for(let d of f.rows??[]){let t=Object.keys(d);if(!t.length||!t.every(p=>D.test(p)))throw new Error("Colonnes invalides");let b=await _.query(`insert into public.${s} (${t.join(", ")}) values (${t.map((p,S)=>`$${S+1}`).join(", ")}) returning *`,t.map(p=>d[p]));a.push(b.rows[0])}return a})}:{status:403,body:{message:"Table non \xE9crivable"}};if((z[0]==="update"||z[0]==="delete")&&v==="POST"){if(!de.has(s))return{status:403,body:{message:"Table non \xE9crivable"}};let{id:m,values:_={}}=f;if(!m)return{status:400,body:{message:"Identifiant manquant"}};let a=await E(r,$.id,async d=>{if(z[0]==="delete")return(await d.query(`delete from public.${s} where id = $1 returning *`,[m])).rows;let t=Object.keys(_);if(!t.length||!t.every(b=>D.test(b)))throw new Error("Colonnes invalides");return(await d.query(`update public.${s} set ${t.map((b,p)=>`${b} = $${p+2}`).join(", ")} where id = $1 returning *`,[m,...t.map(b=>_[b])])).rows});return a.length?{status:200,body:a}:{status:403,body:{message:"Modification impossible : cette ligne n'est plus modifiable."}}}if(z[0]==="rpc"&&v==="POST"){let m=await h(s),_=f.args??{},a=Object.keys(_);if(!a.every(p=>D.test(p)&&m.has(p)))return{status:400,body:{message:"Arguments invalides pour "+s}};let d=a.map(p=>m.get(p)==="jsonb"?JSON.stringify(_[p]):_[p]),t=`select * from public.${s}(${a.map((p,S)=>`${p} => $${S+1}`).join(", ")})`;return{status:200,body:await E(r,$.id,async p=>(await p.query(t,d)).rows)}}return{status:404,body:{message:"Introuvable"}}}let g=Promise.resolve();return function(y){let f=async()=>{try{return await C(y)}catch(w){return{status:w.code==="42501"?403:w.code==="P0002"?404:400,body:{message:w.message,code:w.code??null,hint:w.hint??null}}}},x=g.then(f,f);return g=x,x}}var me=[{name:"local/supabase_shim.sql",sql:`-- =====================================================================
--  Simulation locale de Supabase \u2014 UNIQUEMENT pour les tests (PGlite)
--
--  Reproduit ce dont les migrations et la RLS d\xE9pendent :
--    \u2022 le sch\xE9ma auth, avec auth.users, auth.uid() et auth.role()
--    \u2022 les r\xF4les anon / authenticated / service_role
--    \u2022 les droits par d\xE9faut que Supabase accorde sur \`public\`.
--      Ils sont reproduits volontairement : sur Supabase, authenticated
--      peut \xE9crire dans toute table de public au niveau des GRANT. La
--      s\xE9curit\xE9 repose donc sur la RLS, et les tests doivent le prouver
--      dans ces conditions, pas dans un environnement plus ferm\xE9.
--
--  \u26A0\uFE0F Ce fichier n'est JAMAIS appliqu\xE9 sur un projet Supabase r\xE9el.
-- =====================================================================

do $$ begin
  create role anon nologin;
exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin;
exception when duplicate_object then null; end $$;
do $$ begin
  create role service_role nologin bypassrls;
exception when duplicate_object then null; end $$;

create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique,
  phone              text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

-- M\xEAme m\xE9canique que Supabase : l'identit\xE9 vient des claims du JWT,
-- expos\xE9s par PostgREST sous forme de param\xE8tres de session.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon')
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;
`},{name:"platform/P0001__schema_platform.sql",sql:`-- =====================================================================
--  P0001 \u2014 Sch\xE9ma plateforme : fondations
--
--  Cr\xE9e le sch\xE9ma \`platform\`, les extensions, les types \xE9num\xE9r\xE9s et les
--  triggers utilitaires communs \xE0 tous les produits GESPRO.
--
--  Convention de s\xE9curit\xE9 appliqu\xE9e \xE0 TOUTES les fonctions du socle :
--    language sql|plpgsql
--    stable|volatile
--    security definer
--    set search_path = ''      \u2190 noms pleinement qualifi\xE9s, obligatoire
--
--  Le \`search_path = ''\` prot\xE8ge contre le d\xE9tournement de r\xE9solution de
--  noms : une fonction SECURITY DEFINER qui laisse un search_path mutable
--  peut \xEAtre amen\xE9e \xE0 ex\xE9cuter une table ou une fonction fournie par
--  l'appelant. C'est plus verbeux, et c'est le prix d'un socle de s\xE9curit\xE9.
-- =====================================================================

create schema if not exists platform;

comment on schema platform is
  'Socle GESPRO : organisations, membres, r\xF4les, permissions, audit. '
  'Source unique : d\xE9p\xF4t gespro-db. Un produit ne modifie jamais ce sch\xE9ma.';

-- \u26A0\uFE0F Ne PAS imposer \`with schema public\` : Supabase pr\xE9-installe pgcrypto
--    dans le sch\xE9ma \`extensions\`. La clause serait alors sans effet (a peine
--    l'extension existe-t-elle), et tout appel \xE0 \`public.gen_random_bytes()\`
--    \xE9chouerait \xE0 l'ex\xE9cution. Le socle n'en d\xE9pend donc pas : \`gen_random_uuid()\`
--    est natif de pg_catalog depuis PostgreSQL 13.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  TYPES \xC9NUM\xC9R\xC9S
-- ---------------------------------------------------------------------

-- Cycle de vie d'une organisation cliente.
do $$ begin
  create type platform.organization_status as enum (
    'trial',       -- p\xE9riode d'essai
    'active',      -- abonnement en cours
    'suspended',   -- impay\xE9 ou suspension administrative \u2014 acc\xE8s coup\xE9
    'cancelled'    -- r\xE9sili\xE9 \u2014 conserv\xE9 pour l'historique et l'export
  );
exception when duplicate_object then null; end $$;

-- Cycle de vie d'un lien utilisateur \u2194 organisation.
--
-- \u26A0\uFE0F Seul \`active\` ouvre l'acc\xE8s. Voir platform.current_org_ids() (P0004) :
--    la suspension doit \xEAtre effective EN BASE, pas seulement dans l'UI.
--    Le\xE7on GesSchool 032-D : une suspension appliqu\xE9e c\xF4t\xE9 client seulement
--    permettait \xE0 l'utilisateur de se r\xE9activer lui-m\xEAme.
do $$ begin
  create type platform.membership_status as enum (
    'pending',     -- invitation accept\xE9e, compte pas encore activ\xE9
    'active',      -- seul statut qui ouvre l'acc\xE8s
    'suspended',   -- suspendu \u2014 conserve l'historique, coupe l'acc\xE8s
    'revoked'      -- retir\xE9 de l'organisation
  );
exception when duplicate_object then null; end $$;

-- Statut d'une invitation.
do $$ begin
  create type platform.invitation_status as enum (
    'active', 'used', 'revoked', 'expired'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
--  TRIGGERS UTILITAIRES
-- ---------------------------------------------------------------------

-- Maintient \`updated_at\`. \xC0 poser sur toute table portant la colonne.
create or replace function platform.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

comment on function platform.set_updated_at() is
  'Trigger BEFORE UPDATE : maintient updated_at. Voir platform.attach_updated_at().';

-- Pose le trigger updated_at sur une table, sans le dupliquer.
create or replace function platform.attach_updated_at(p_schema text, p_table text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  execute format(
    'drop trigger if exists trg_%1$s_updated_at on %2$I.%1$I',
    p_table, p_schema);
  execute format(
    'create trigger trg_%1$s_updated_at before update on %2$I.%1$I '
    || 'for each row execute function platform.set_updated_at()',
    p_table, p_schema);
end $$;

comment on function platform.attach_updated_at(text, text) is
  'Pose le trigger updated_at sur une table. Idempotent.';

-- ---------------------------------------------------------------------
--  GARDE-FOU \u2014 colonne d'isolation immuable
-- ---------------------------------------------------------------------
--
-- Emp\xEAche le d\xE9placement d'une ligne d'une organisation vers une autre.
--
-- \u26A0\uFE0F Le\xE7on GesSchool 032-B : la policy \xAB profils_self \xBB (id = auth.uid()
--    en FOR ALL) laissait l'utilisateur modifier sa propre ligne, DONT son
--    ecole_id \u2192 saut de tenant. Une policy en \xE9criture ne suffit pas : m\xEAme
--    un membre l\xE9gitime ne doit pas pouvoir r\xE9affecter une ligne.
--
-- \xC0 poser sur toute table portant organization_id, dans les produits aussi.
create or replace function platform.forbid_organization_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- \u26A0\uFE0F Ne JAMAIS r\xE9f\xE9rencer \`old.id\` ici : le trigger est g\xE9n\xE9rique et
  --    s'applique aussi \xE0 des tables sans colonne \`id\` \u2014 organization_settings
  --    a pour cl\xE9 primaire \`organization_id\`. Un \`old.id\` compilerait sans
  --    erreur (plpgsql r\xE9sout tardivement) puis \xE9chouerait \xE0 la premi\xE8re
  --    modification, en production.
  if new.organization_id is distinct from old.organization_id then
    raise exception
      'organization_id est immuable (table %.%)',
      tg_table_schema, tg_table_name
      using errcode = 'check_violation',
            hint = 'Supprimer puis recr\xE9er la ligne dans l''organisation cible.';
  end if;
  return new;
end $$;

comment on function platform.forbid_organization_change() is
  'Trigger BEFORE UPDATE : rend organization_id immuable (anti saut de tenant).';

create or replace function platform.attach_org_immutability(p_schema text, p_table text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  execute format(
    'drop trigger if exists trg_%1$s_org_immutable on %2$I.%1$I',
    p_table, p_schema);
  execute format(
    'create trigger trg_%1$s_org_immutable before update on %2$I.%1$I '
    || 'for each row execute function platform.forbid_organization_change()',
    p_table, p_schema);
end $$;

comment on function platform.attach_org_immutability(text, text) is
  'Rend organization_id immuable sur une table. Idempotent. '
  '\xC0 appliquer sur TOUTE table m\xE9tier portant organization_id.';

-- ---------------------------------------------------------------------
--  EXPOSITION
-- ---------------------------------------------------------------------
-- Le sch\xE9ma est traversable, mais rien n'y est lisible par d\xE9faut :
-- chaque table ouvre explicitement ses droits (P0002+), sous RLS.
grant usage on schema platform to authenticated, anon;

-- Les fonctions utilitaires ne sont pas appelables par le client.
revoke all on function platform.attach_updated_at(text, text) from public;
revoke all on function platform.attach_org_immutability(text, text) from public;
`},{name:"platform/P0002__organizations_memberships.sql",sql:`-- =====================================================================
--  P0002 \u2014 Organisations, profils, memberships et p\xE9rim\xE8tres
--
--  Le c\u0153ur de l'isolation. Deux niveaux, tous deux obligatoires :
--
--    1. INTER-organisations \u2014 un client ne voit jamais les donn\xE9es d'un
--       autre. Port\xE9 par \`organization_id\` + memberships.
--
--    2. INTRA-organisation \u2014 un membre ne voit ou n'\xE9crit que dans son
--       sous-p\xE9rim\xE8tre (ses classes, ses sites, son point de vente).
--       Port\xE9 par \`membership_scopes\`.
--
--  Le second est aussi critique que le premier et bien plus facile \xE0
--  oublier : c'est exactement la faille GesSchool 058.
--
--  RLS est activ\xE9e ici SANS policy \u2192 refus par d\xE9faut. Les policies
--  arrivent en P0004, une fois les fonctions de s\xE9curit\xE9 disponibles.
--  Aucune fen\xEAtre d'exposition entre les deux migrations.
--
--  \u26A0\uFE0F Pourquoi PAS de \`force row level security\` sur ces tables :
--     FORCE soumet aussi le PROPRI\xC9TAIRE de la table \xE0 la RLS. Or les
--     fonctions de s\xE9curit\xE9 (P0004) sont SECURITY DEFINER et doivent lire
--     memberships / organizations / roles SANS RLS \u2014 c'est pr\xE9cis\xE9ment ce
--     qui \xE9vite la r\xE9cursion infinie (une policy sur memberships qui
--     appellerait current_org_ids() qui relit memberships\u2026).
--     FORCE ici casserait le socle de fa\xE7on silencieuse.
--     La protection \xE9quivalente est obtenue autrement : aucune policy
--     d'\xE9criture sur les tables sensibles, \xE9critures par RPC uniquement.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. ORGANIZATIONS \u2014 le client final
-- ---------------------------------------------------------------------
create table if not exists platform.organizations (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique
                check (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
  name          text not null check (length(trim(name)) > 0),
  product       text not null,          -- 'gesschool', 'geshotel', 'gesclean'\u2026
  status        platform.organization_status not null default 'trial',

  -- Contexte r\xE9gional \u2014 dimensionnant en Afrique de l'Ouest.
  country_code  char(2) not null default 'SN',
  currency      char(3) not null default 'XOF',
  timezone      text    not null default 'Africa/Dakar',
  locale        text    not null default 'fr',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table platform.organizations is
  'Le client final : une \xE9cole, un h\xF4tel, une soci\xE9t\xE9 de nettoyage.';
comment on column platform.organizations.status is
  'Seul \`trial\` ou \`active\` ouvre l''acc\xE8s \u2014 voir platform.current_org_ids().';

create index if not exists idx_organizations_product_status
  on platform.organizations (product, status) where deleted_at is null;

alter table platform.organizations enable row level security;

select platform.attach_updated_at('platform', 'organizations');

-- ---------------------------------------------------------------------
--  2. ORGANIZATION_SETTINGS \u2014 identit\xE9 et param\xE8tres
-- ---------------------------------------------------------------------
create table if not exists platform.organization_settings (
  organization_id uuid primary key
                  references platform.organizations(id) on delete cascade,

  -- Identit\xE9 affich\xE9e sur les documents
  legal_name      text,
  slogan          text,
  description     text,
  address         text,
  phone           text,
  phone_secondary text,
  email           text,
  website         text,
  tax_id          text,                 -- NINEA / RCCM
  logo_url        text,
  signature_url   text,
  stamp_url       text,

  -- Num\xE9rotation documentaire (voir P0008)
  numbering       jsonb not null default '{}'::jsonb,
  preferences     jsonb not null default '{}'::jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table platform.organization_settings is
  'Param\xE8tres d''une organisation. Remplace les \`company_settings\` par '
  'utilisateur de GesClean (migration 002_multi_tenant).';

alter table platform.organization_settings enable row level security;

select platform.attach_updated_at('platform', 'organization_settings');
-- organization_id est ici la cl\xE9 primaire, mais rien n'interdit de la muter :
-- le trigger vaut sur TOUTE table qui porte la colonne, sans exception.
select platform.attach_org_immutability('platform', 'organization_settings');

-- ---------------------------------------------------------------------
--  3. USERS_PROFILE \u2014 miroir applicatif de auth.users
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F Table volontairement SANS policy d'\xE9criture (P0004).
--
--    Le\xE7on GesSchool 032-B : une policy \xAB id = auth.uid() \xBB en FOR ALL
--    laissait l'utilisateur modifier sa propre ligne \u2014 dont son tenant
--    (saut d'organisation) et son indicateur d'activit\xE9 (auto-r\xE9activation
--    apr\xE8s suspension). Deux escalades de privil\xE8ges dans une seule policy.
--
--    Ici, \`is_active\` est administratif et l'appartenance vit dans
--    \`memberships\`. Les champs cosm\xE9tiques se modifient par la RPC
--    platform.update_my_profile(), qui n'expose que ceux-l\xE0.
create table if not exists platform.users_profile (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  avatar_url   text,
  locale       text not null default 'fr',

  is_active    boolean not null default true,   -- administratif \u2014 jamais self-writable
  is_platform_admin boolean not null default false, -- support GesPro \u2014 jamais self-writable

  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table platform.users_profile is
  'Miroir de auth.users. AUCUNE \xE9criture directe : voir update_my_profile().';
comment on column platform.users_profile.is_platform_admin is
  'Support GesPro. Toute action sous ce drapeau est trac\xE9e dans platform.audit_log.';

alter table platform.users_profile enable row level security;

select platform.attach_updated_at('platform', 'users_profile');

-- Cr\xE9ation automatique du profil \xE0 l'inscription.
create or replace function platform.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into platform.users_profile (id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function platform.handle_new_user();

-- ---------------------------------------------------------------------
--  4. MEMBERSHIPS \u2014 le pivot de l'isolation
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F Table volontairement SANS policy d'\xE9criture (P0004).
--    \xC9critures uniquement par RPC SECURITY DEFINER (P0005), qui applique
--    la matrice de d\xE9l\xE9gation. Sans cela, un membre pourrait s'octroyer
--    un r\xF4le sup\xE9rieur \u2014 c'est la faille GesSchool 032-A, transpos\xE9e.
create table if not exists platform.memberships (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  role_id         uuid not null,        -- FK ajout\xE9e en P0003 (roles n'existe pas encore)
  status          platform.membership_status not null default 'pending',

  invited_by      uuid references auth.users(id) on delete set null,
  joined_at       timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Un utilisateur n'a qu'un seul lien par organisation.
  constraint uq_memberships_user_org unique (user_id, organization_id)
);

comment on table platform.memberships is
  'Lien user \u2194 organization, porteur du r\xF4le. Pivot de l''isolation. '
  'AUCUNE \xE9criture directe : voir les RPC de P0005.';

create index if not exists idx_memberships_user_active
  on platform.memberships (user_id) where status = 'active';
create index if not exists idx_memberships_org
  on platform.memberships (organization_id, status);

alter table platform.memberships enable row level security;

select platform.attach_updated_at('platform', 'memberships');
select platform.attach_org_immutability('platform', 'memberships');

-- ---------------------------------------------------------------------
--  5. MEMBERSHIP_SCOPES \u2014 cloisonnement INTRA-organisation
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F La primitive que la conception initiale avait manqu\xE9e.
--
--    Le\xE7on GesSchool 058 : la migration 018 restreignait les notes au R\xD4LE
--    \xAB enseignant \xBB, mais pas \xE0 SES classes. Le filtrage \xAB mes classes \xBB
--    n'existait que dans l'interface \u2192 n'importe quel enseignant pouvait
--    lire et \xE9crire les notes de toute l'\xE9cole par appel API direct.
--
--    Traduction en r\xE8gle de plateforme :
--    \xAB un filtrage pr\xE9sent uniquement dans l'interface n'est pas une s\xE9curit\xE9 \xBB.
--
-- S\xE9mantique de \`in_scope()\` (P0004), volontairement permissive par d\xE9faut :
--    AUCUNE ligne pour (membership, scope_type)  \u2192 acc\xE8s \xE0 TOUT ce type
--                                                  (cas de la direction)
--    AU MOINS UNE ligne                          \u2192 acc\xE8s aux seuls scope_id list\xE9s
--
-- Ajouter une restriction est donc un acte explicite, et l'absence de
-- restriction ne verrouille jamais un r\xF4le de direction par inadvertance.
create table if not exists platform.membership_scopes (
  id            uuid primary key default gen_random_uuid(),
  membership_id uuid not null references platform.memberships(id) on delete cascade,

  -- Type de p\xE9rim\xE8tre, d\xE9fini par le produit : 'class', 'site', 'outlet',
  -- 'property', 'department'\u2026 Volontairement \`text\` et non enum : le socle
  -- ne conna\xEEt pas les p\xE9rim\xE8tres m\xE9tier de ses produits.
  scope_type    text not null check (scope_type ~ '^[a-z][a-z0-9_]*$'),

  -- Identifiant de l'objet du p\xE9rim\xE8tre, dans le sch\xE9ma du produit.
  -- Pas de FK : le socle ignore les tables m\xE9tier.
  scope_id      uuid not null,

  created_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,

  constraint uq_membership_scope unique (membership_id, scope_type, scope_id)
);

comment on table platform.membership_scopes is
  'Cloisonnement intra-organisation : ses classes, ses sites, son point de vente. '
  'Aucune ligne pour un scope_type = acc\xE8s complet \xE0 ce type.';

create index if not exists idx_membership_scopes_lookup
  on platform.membership_scopes (membership_id, scope_type, scope_id);

alter table platform.membership_scopes enable row level security;

-- ---------------------------------------------------------------------
--  6. RPC \u2014 mise \xE0 jour de son propre profil
-- ---------------------------------------------------------------------
--
-- Seule voie d'\xE9criture sur users_profile pour l'utilisateur. N'expose que
-- les champs cosm\xE9tiques : ni is_active, ni is_platform_admin.
create or replace function platform.update_my_profile(
  p_full_name  text default null,
  p_phone      text default null,
  p_avatar_url text default null,
  p_locale     text default null
)
returns platform.users_profile
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_row platform.users_profile;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.' using errcode = '42501';
  end if;

  update platform.users_profile
     set full_name  = coalesce(nullif(trim(p_full_name), ''),  full_name),
         phone      = coalesce(nullif(trim(p_phone), ''),      phone),
         avatar_url = coalesce(nullif(trim(p_avatar_url), ''), avatar_url),
         locale     = coalesce(nullif(trim(p_locale), ''),     locale)
   where id = auth.uid()
   returning * into v_row;

  if not found then
    raise exception 'Profil introuvable.' using errcode = 'P0002';
  end if;

  return v_row;
end $$;

comment on function platform.update_my_profile(text, text, text, text) is
  'Seule voie d''\xE9criture sur son profil. N''expose jamais is_active ni is_platform_admin.';

revoke all on function platform.update_my_profile(text, text, text, text) from public;
grant execute on function platform.update_my_profile(text, text, text, text) to authenticated;
`},{name:"platform/P0003__rbac_roles_permissions.sql",sql:`-- =====================================================================
--  P0003 \u2014 RBAC : r\xF4les, permissions, hi\xE9rarchie de d\xE9l\xE9gation
--
--  \u26A0\uFE0F Le\xE7on GesSchool 018 + 032-C, la plus co\xFBteuse des six.
--
--     018 : le contr\xF4le d'acc\xE8s m\xE9tier vivait dans src/lib/permissions.js,
--           c\xF4t\xE9 client. En base, la policy g\xE9n\xE9rique n'isolait que par
--           tenant \u2192 un enseignant pouvait \xE9crire dans les paiements de
--           son \xE9cole par appel API direct. Escalade intra-tenant.
--
--     032-C : le r\xF4le \xAB secretaire \xBB avait des acc\xE8s dans l'interface mais
--           AUCUNE policy correspondante en base. L'UI et la base avaient
--           diverg\xE9 sans que rien ne le signale.
--
--  R\xE9ponse du socle : le catalogue de permissions est d\xE9claratif et vit EN
--  BASE. Les policies s'y adossent, l'interface le refl\xE8te. Il n'y a plus
--  deux sources de v\xE9rit\xE9 qui peuvent diverger \u2014 il n'y en a qu'une.
--
--  Le rang (\`rank\`) g\xE9n\xE9ralise la matrice de d\xE9l\xE9gation de GesSchool 029
--  (\`_peut_inviter\`) : au lieu d'\xE9num\xE9rer les couples autoris\xE9s, un membre
--  ne peut g\xE9rer que des r\xF4les STRICTEMENT MOINS puissants que le sien.
--  Ajouter un r\xF4le ne demande alors plus de toucher \xE0 la matrice.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. PERMISSIONS \u2014 catalogue plat, source de v\xE9rit\xE9 unique
-- ---------------------------------------------------------------------
create table if not exists platform.permissions (
  key         text primary key
              check (key ~ '^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+$'),
  domain      text not null,          -- 'invoice', 'member', 'settings'
  action      text not null           -- read | write | delete | export | validate | manage
              check (action in ('read','write','delete','export','validate','manage')),
  label       text not null,          -- libell\xE9 affich\xE9 (fran\xE7ais)
  description text,
  product     text,                   -- null = permission de plateforme
  created_at  timestamptz not null default now()
);

comment on table platform.permissions is
  'Catalogue d\xE9claratif des permissions. Source unique : les policies RLS '
  's''y adossent, l''interface le refl\xE8te. Format : domaine.action.';

create index if not exists idx_permissions_product on platform.permissions (product);

alter table platform.permissions enable row level security;

-- ---------------------------------------------------------------------
--  2. ROLES
-- ---------------------------------------------------------------------
create table if not exists platform.roles (
  id              uuid primary key default gen_random_uuid(),

  -- null = r\xF4le syst\xE8me, partag\xE9 par toutes les organisations.
  -- non null = r\xF4le personnalis\xE9, propre \xE0 une organisation.
  organization_id uuid references platform.organizations(id) on delete cascade,

  -- null = r\xF4le transverse \xE0 tous les produits.
  product         text,

  key             text not null check (key ~ '^[a-z][a-z0-9_]*$'),
  label           text not null,
  description     text,

  -- Hi\xE9rarchie de d\xE9l\xE9gation. PLUS BAS = PLUS PUISSANT.
  -- Un membre ne peut g\xE9rer que des r\xF4les de rang strictement sup\xE9rieur au sien.
  rank            integer not null check (rank between 0 and 1000),

  is_system       boolean not null default false,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint uq_roles_scope unique nulls not distinct (organization_id, product, key)
);

comment on table platform.roles is
  'R\xF4les syst\xE8me (organization_id null) et personnalis\xE9s. '
  'rank : plus bas = plus puissant ; base de la d\xE9l\xE9gation (voir P0005).';
comment on column platform.roles.rank is
  'Hi\xE9rarchie de d\xE9l\xE9gation. Un membre ne g\xE8re que des r\xF4les de rang STRICTEMENT sup\xE9rieur.';

create index if not exists idx_roles_org on platform.roles (organization_id);

alter table platform.roles enable row level security;

select platform.attach_updated_at('platform', 'roles');
-- Un r\xF4le maison ne se d\xE9place pas d'une organisation \xE0 l'autre : ce serait
-- transf\xE9rer un jeu de permissions \xE0 un tenant qui ne l'a jamais accord\xE9.
-- (Les r\xF4les syst\xE8me ont organization_id null des deux c\xF4t\xE9s : le trigger
--  les laisse passer, \`null is distinct from null\` \xE9tant faux.)
select platform.attach_org_immutability('platform', 'roles');

-- ---------------------------------------------------------------------
--  3. ROLE_PERMISSIONS
-- ---------------------------------------------------------------------
create table if not exists platform.role_permissions (
  role_id        uuid not null references platform.roles(id) on delete cascade,
  permission_key text not null references platform.permissions(key) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (role_id, permission_key)
);

comment on table platform.role_permissions is
  'Association r\xF4le \u2194 permissions. Lue par platform.has_permission().';

alter table platform.role_permissions enable row level security;

-- ---------------------------------------------------------------------
--  4. FK diff\xE9r\xE9e depuis memberships (roles n'existait pas en P0002)
-- ---------------------------------------------------------------------
do $$ begin
  alter table platform.memberships
    add constraint fk_memberships_role
    foreign key (role_id) references platform.roles(id) on delete restrict;
exception when duplicate_object then null; end $$;

-- =====================================================================
--  SEEDS \u2014 catalogue de permissions de plateforme
-- =====================================================================
insert into platform.permissions (key, domain, action, label, description) values
  -- Organisation
  ('organization.read',   'organization', 'read',   'Voir l''organisation',        null),
  ('organization.manage', 'organization', 'manage', 'Administrer l''organisation', 'Renommer, suspendre, param\xE9trer'),
  -- Param\xE8tres
  ('settings.read',       'settings',     'read',   'Voir les param\xE8tres',         null),
  ('settings.manage',     'settings',     'manage', 'Modifier les param\xE8tres',     'Identit\xE9, logo, signature, num\xE9rotation'),
  -- Membres et r\xF4les
  ('member.read',         'member',       'read',   'Voir les membres',            null),
  ('member.invite',       'member',       'write',  'Inviter un membre',           'Limit\xE9 aux r\xF4les moins puissants que le sien'),
  ('member.manage',       'member',       'manage', 'G\xE9rer les membres',           'Suspendre, r\xE9voquer, changer de r\xF4le et de p\xE9rim\xE8tre'),
  ('role.manage',         'role',         'manage', 'G\xE9rer les r\xF4les',             'Cr\xE9er et modifier des r\xF4les personnalis\xE9s'),
  -- Audit
  ('audit.read',          'audit',        'read',   'Consulter le journal d''audit', null),
  -- Facturation de l'abonnement GesPro
  ('billing.read',        'billing',      'read',   'Voir l''abonnement',          null),
  ('billing.manage',      'billing',      'manage', 'G\xE9rer l''abonnement',         'Changer de plan, moyens de paiement'),
  -- Documents
  ('document.read',       'document',     'read',   'Consulter les documents',     null),
  ('document.create',     'document',     'write',  'G\xE9n\xE9rer un document',         null),
  ('document.delete',     'document',     'delete', 'Supprimer un document',       null),
  -- Notifications
  ('notification.send',   'notification', 'write',  'Envoyer une notification',    'Email, WhatsApp, push, SMS'),
  -- Rapports
  ('report.read',         'report',       'read',   'Consulter les rapports',      null),
  ('report.export',       'report',       'export', 'Exporter les rapports',       'Excel, CSV, PDF')
on conflict (key) do update
  set label       = excluded.label,
      description = excluded.description,
      domain      = excluded.domain,
      action      = excluded.action;

-- =====================================================================
--  SEEDS \u2014 six r\xF4les syst\xE8me
-- =====================================================================
insert into platform.roles (organization_id, product, key, label, description, rank, is_system) values
  (null, null, 'owner',    'Propri\xE9taire',    'Tous droits, y compris la facturation de l''abonnement', 10, true),
  (null, null, 'admin',    'Administrateur',  'Administration compl\xE8te hors facturation',               20, true),
  (null, null, 'manager',  'Responsable',     'Gestion op\xE9rationnelle d''un p\xE9rim\xE8tre',                 30, true),
  (null, null, 'operator', 'Op\xE9rateur',       'Saisie quotidienne',                                     40, true),
  (null, null, 'viewer',   'Lecture seule',   'Consultation sans modification',                         50, true),
  (null, null, 'external', 'Acc\xE8s externe',   'Acc\xE8s limit\xE9 et cloisonn\xE9 : parent, client, fournisseur', 60, true)
on conflict on constraint uq_roles_scope do update
  set label       = excluded.label,
      description = excluded.description,
      rank        = excluded.rank;

-- ---------------------------------------------------------------------
--  Attribution des permissions aux r\xF4les syst\xE8me
-- ---------------------------------------------------------------------
do $$
declare
  v_owner    uuid; v_admin    uuid; v_manager uuid;
  v_operator uuid; v_viewer   uuid;
begin
  select id into v_owner    from platform.roles where is_system and key = 'owner';
  select id into v_admin    from platform.roles where is_system and key = 'admin';
  select id into v_manager  from platform.roles where is_system and key = 'manager';
  select id into v_operator from platform.roles where is_system and key = 'operator';
  select id into v_viewer   from platform.roles where is_system and key = 'viewer';

  -- owner : tout le catalogue de plateforme
  insert into platform.role_permissions (role_id, permission_key)
  select v_owner, key from platform.permissions where product is null
  on conflict do nothing;

  -- admin : tout sauf la facturation de l'abonnement
  insert into platform.role_permissions (role_id, permission_key)
  select v_admin, key from platform.permissions
   where product is null and key not like 'billing.%'
  on conflict do nothing;

  -- manager : op\xE9rationnel + lecture d'audit, sans gestion des r\xF4les
  insert into platform.role_permissions (role_id, permission_key)
  values
    (v_manager, 'organization.read'), (v_manager, 'settings.read'),
    (v_manager, 'member.read'),       (v_manager, 'member.invite'),
    (v_manager, 'audit.read'),
    (v_manager, 'document.read'),     (v_manager, 'document.create'),
    (v_manager, 'notification.send'),
    (v_manager, 'report.read'),       (v_manager, 'report.export')
  on conflict do nothing;

  -- operator : saisie
  insert into platform.role_permissions (role_id, permission_key)
  values
    (v_operator, 'organization.read'), (v_operator, 'settings.read'),
    (v_operator, 'member.read'),
    (v_operator, 'document.read'),     (v_operator, 'document.create'),
    (v_operator, 'report.read')
  on conflict do nothing;

  -- viewer : lecture stricte
  insert into platform.role_permissions (role_id, permission_key)
  values
    (v_viewer, 'organization.read'), (v_viewer, 'settings.read'),
    (v_viewer, 'member.read'),
    (v_viewer, 'document.read'),     (v_viewer, 'report.read')
  on conflict do nothing;

  -- external : AUCUNE permission de plateforme par d\xE9faut.
  -- Un parent, un client ou un fournisseur n'acc\xE8de qu'\xE0 des RPC d\xE9di\xE9es
  -- du produit (patron \`enfant_*\` de GesSchool), jamais aux tables.
end $$;
`},{name:"platform/P0004__rls_helpers.sql",sql:`-- =====================================================================
--  P0004 \u2014 Les quatre fonctions de s\xE9curit\xE9 + RLS des tables plateforme
--
--  C'est LE fichier critique du socle. Toute policy de tout produit
--  s'\xE9crit avec ces quatre fonctions, et uniquement avec elles.
--
--  Pourquoi SECURITY DEFINER, imp\xE9rativement :
--    une policy sur \`memberships\` qui appellerait current_org_ids(), qui
--    relirait \`memberships\` sous RLS, provoquerait une r\xE9cursion infinie.
--    SECURITY DEFINER fait lire ces tables HORS RLS et coupe le cycle.
--    C'est aussi pourquoi ces tables n'ont pas FORCE RLS (voir P0002).
--
--  Pourquoi STABLE :
--    le planificateur peut alors \xE9valuer la fonction une seule fois par
--    requ\xEAte au lieu d'une fois par ligne. Sur une policy appliqu\xE9e \xE0
--    100 000 lignes, la diff\xE9rence n'est pas cosm\xE9tique.
--
--  Pourquoi search_path = '' :
--    une fonction SECURITY DEFINER dont le search_path reste mutable peut
--    \xEAtre amen\xE9e \xE0 ex\xE9cuter une table ou une fonction fournie par
--    l'appelant. Tous les noms sont donc pleinement qualifi\xE9s.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. current_org_ids() \u2014 isolation INTER-organisations
-- ---------------------------------------------------------------------
--
-- Trois verrous cumulatifs, tous n\xE9cessaires :
--   \u2022 le membership est \`active\`         (retrait ou suspension d'un membre)
--   \u2022 le profil est \`is_active\`          (suspension globale du compte)
--   \u2022 l'organisation est \`trial\`/\`active\` (impay\xE9, r\xE9siliation)
--
-- \u26A0\uFE0F Le\xE7on GesSchool 032-D : la suspension n'\xE9tait appliqu\xE9e que c\xF4t\xE9
--    client, donc contournable \u2014 l'utilisateur pouvait se r\xE9activer. Ici
--    elle est effective en base : un compte suspendu obtient un tableau
--    vide, et TOUTES les policies qui s'y adossent tombent d'un coup.
--
-- D\xE9cision : un administrateur de plateforme n'est PAS inclus ici. Son
-- acc\xE8s doit \xEAtre explicite et audit\xE9, jamais un effet de bord silencieux.
create or replace function platform.current_org_ids()
returns uuid[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(distinct m.organization_id), '{}'::uuid[])
    from platform.memberships   m
    join platform.users_profile p on p.id = m.user_id
    join platform.organizations o on o.id = m.organization_id
   where m.user_id    = auth.uid()
     and m.status     = 'active'
     and p.is_active
     and o.status     in ('trial', 'active')
     and o.deleted_at is null;
$$;

comment on function platform.current_org_ids() is
  'Organisations actives de l''appelant. Socle de l''isolation inter-organisations. '
  'Renvoie {} si le compte, le membership ou l''organisation est suspendu.';

-- ---------------------------------------------------------------------
--  2. has_permission() \u2014 autorisation
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F Le\xE7on GesSchool 018 : le contr\xF4le par r\xF4le vivait c\xF4t\xE9 client ; en
--    base, seule l'isolation par tenant existait. Tout membre pouvait donc
--    \xE9crire dans n'importe quelle table de son organisation par appel API
--    direct. Une permission v\xE9rifi\xE9e uniquement dans l'interface n'est pas
--    une permission.
create or replace function platform.has_permission(
  p_organization_id uuid,
  p_permission_key  text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from platform.memberships      m
      join platform.users_profile    p  on p.id = m.user_id
      join platform.organizations    o  on o.id = m.organization_id
      join platform.role_permissions rp on rp.role_id = m.role_id
     where m.user_id         = auth.uid()
       and m.organization_id = p_organization_id
       and m.status          = 'active'
       and p.is_active
       and o.status          in ('trial', 'active')
       and o.deleted_at      is null
       and rp.permission_key = p_permission_key
  );
$$;

comment on function platform.has_permission(uuid, text) is
  'L''appelant d\xE9tient-il cette permission dans cette organisation ?';

-- ---------------------------------------------------------------------
--  3. in_scope() \u2014 cloisonnement INTRA-organisation
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F Le\xE7on GesSchool 058, la plus subtile des six.
--    La migration 018 restreignait les notes au R\xD4LE \xAB enseignant \xBB, mais
--    pas \xE0 SES classes. Le filtrage \xAB mes classes \xBB n'existait que dans
--    l'interface \u2192 n'importe quel enseignant pouvait lire ET \xE9crire les
--    notes de toute l'\xE9cole par appel API direct.
--
--    R\xE8gle qui en d\xE9coule, valable pour toute la plateforme :
--    \xAB un filtrage pr\xE9sent uniquement dans l'interface n'est pas une
--      s\xE9curit\xE9 \xBB. Tout cloisonnement affich\xE9 doit avoir sa policy RLS et
--      un test pgTAP qui l'attaque par appel API direct.
--
-- S\xE9mantique, volontairement permissive par d\xE9faut :
--    AUCUNE ligne pour (membership, scope_type) \u2192 acc\xE8s \xE0 TOUT ce type
--                                                 (cas de la direction)
--    AU MOINS UNE ligne                         \u2192 acc\xE8s aux seuls scope_id list\xE9s
--
-- Restreindre est donc un acte explicite : on ne verrouille jamais un r\xF4le
-- de direction par simple oubli de peuplement.
create or replace function platform.in_scope(
  p_organization_id uuid,
  p_scope_type      text,
  p_scope_id        uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with my_membership as (
    select m.id
      from platform.memberships   m
      join platform.users_profile p on p.id = m.user_id
      join platform.organizations o on o.id = m.organization_id
     where m.user_id         = auth.uid()
       and m.organization_id = p_organization_id
       and m.status          = 'active'
       and p.is_active
       and o.status          in ('trial', 'active')
       and o.deleted_at      is null
  )
  select
        exists (select 1 from my_membership)
    and (
          -- aucune restriction d\xE9clar\xE9e pour ce type \u2192 acc\xE8s complet
          not exists (
            select 1
              from platform.membership_scopes s
              join my_membership mm on mm.id = s.membership_id
             where s.scope_type = p_scope_type
          )
          -- sinon : l'objet doit figurer dans le p\xE9rim\xE8tre accord\xE9
          or exists (
            select 1
              from platform.membership_scopes s
              join my_membership mm on mm.id = s.membership_id
             where s.scope_type = p_scope_type
               and s.scope_id   = p_scope_id
          )
        );
$$;

comment on function platform.in_scope(uuid, text, uuid) is
  'Cloisonnement intra-organisation : ses classes, ses sites, son point de vente. '
  'Aucune restriction d\xE9clar\xE9e pour un scope_type = acc\xE8s complet \xE0 ce type.';

-- ---------------------------------------------------------------------
--  4. is_platform_admin() \u2014 support GesPro
-- ---------------------------------------------------------------------
--
-- Volontairement absent de current_org_ids() : un acc\xE8s support doit \xEAtre
-- explicite dans la policy qui l'autorise, et trac\xE9 dans platform.audit_log.
create or replace function platform.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from platform.users_profile
     where id = auth.uid()
       and is_active
       and is_platform_admin
  );
$$;

comment on function platform.is_platform_admin() is
  'Support GesPro. Toute action sous ce drapeau doit \xEAtre trac\xE9e dans l''audit.';

-- ---------------------------------------------------------------------
--  5. current_role_rank() \u2014 support de la d\xE9l\xE9gation (P0005)
-- ---------------------------------------------------------------------
--
-- Rang du r\xF4le de l'appelant dans une organisation. Plus bas = plus
-- puissant. Renvoie null s'il n'y est pas membre actif.
create or replace function platform.current_role_rank(p_organization_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select r.rank
    from platform.memberships   m
    join platform.roles         r on r.id = m.role_id
    join platform.users_profile p on p.id = m.user_id
   where m.user_id         = auth.uid()
     and m.organization_id = p_organization_id
     and m.status          = 'active'
     and p.is_active
   limit 1;
$$;

comment on function platform.current_role_rank(uuid) is
  'Rang du r\xF4le de l''appelant dans une organisation. Plus bas = plus puissant.';

-- ---------------------------------------------------------------------
--  Exposition des fonctions
-- ---------------------------------------------------------------------
revoke all on function platform.current_org_ids()            from public;
revoke all on function platform.has_permission(uuid, text)   from public;
revoke all on function platform.in_scope(uuid, text, uuid)   from public;
revoke all on function platform.is_platform_admin()          from public;
revoke all on function platform.current_role_rank(uuid)      from public;

grant execute on function platform.current_org_ids()          to authenticated;
grant execute on function platform.has_permission(uuid, text) to authenticated;
grant execute on function platform.in_scope(uuid, text, uuid) to authenticated;
grant execute on function platform.is_platform_admin()        to authenticated;
grant execute on function platform.current_role_rank(uuid)    to authenticated;


-- =====================================================================
--  POLICIES DES TABLES PLATEFORME
--
--  Principe appliqu\xE9 partout : les tables sensibles (users_profile,
--  memberships, membership_scopes, invitations) n'ont AUCUNE policy
--  d'\xE9criture. Leurs mutations passent exclusivement par des RPC
--  SECURITY DEFINER qui appliquent la d\xE9l\xE9gation.
--
--  \u26A0\uFE0F Le\xE7on GesSchool 032-A : une policy \xAB for all \xBB sur les invitations
--     laissait n'importe quel membre INS\xC9RER une invitation de n'importe
--     quel r\xF4le \u2014 donc s'auto-promouvoir administrateur.
-- =====================================================================

-- ---- organizations ---------------------------------------------------
drop policy if exists organizations_select on platform.organizations;
create policy organizations_select on platform.organizations
  for select to authenticated
  using (id = any (platform.current_org_ids()) or platform.is_platform_admin());

drop policy if exists organizations_update on platform.organizations;
create policy organizations_update on platform.organizations
  for update to authenticated
  using      (platform.has_permission(id, 'organization.manage'))
  with check (platform.has_permission(id, 'organization.manage'));

-- Cr\xE9ation : par la RPC org-provision (Edge Function). Pas de policy insert.
-- Suppression : jamais directe \u2014 suppression logique via deleted_at.

-- ---- organization_settings -------------------------------------------
drop policy if exists organization_settings_select on platform.organization_settings;
create policy organization_settings_select on platform.organization_settings
  for select to authenticated
  using (organization_id = any (platform.current_org_ids()));

drop policy if exists organization_settings_write on platform.organization_settings;
create policy organization_settings_write on platform.organization_settings
  for update to authenticated
  using      (platform.has_permission(organization_id, 'settings.manage'))
  with check (platform.has_permission(organization_id, 'settings.manage'));

-- ---- users_profile ---------------------------------------------------
--
-- Lecture : son propre profil, et celui des membres de ses organisations
-- (n\xE9cessaire pour afficher la liste des membres).
-- \xC9criture : AUCUNE policy. Voir platform.update_my_profile().
drop policy if exists users_profile_select on platform.users_profile;
create policy users_profile_select on platform.users_profile
  for select to authenticated
  using (
        id = auth.uid()
    or  platform.is_platform_admin()
    or  exists (
          select 1
            from platform.memberships m
           where m.user_id = platform.users_profile.id
             and m.organization_id = any (platform.current_org_ids())
        )
  );

-- ---- memberships -----------------------------------------------------
--
-- Lecture : les membres de ses propres organisations.
-- \xC9criture : AUCUNE policy. Voir les RPC de P0005.
drop policy if exists memberships_select on platform.memberships;
create policy memberships_select on platform.memberships
  for select to authenticated
  using (organization_id = any (platform.current_org_ids())
         or platform.is_platform_admin());

-- ---- membership_scopes -----------------------------------------------
--
-- \xC9criture : AUCUNE policy \u2014 sinon un membre pourrait \xE9largir son propre
-- p\xE9rim\xE8tre, ce qui viderait in_scope() de son sens.
drop policy if exists membership_scopes_select on platform.membership_scopes;
create policy membership_scopes_select on platform.membership_scopes
  for select to authenticated
  using (
    exists (
      select 1
        from platform.memberships m
       where m.id = platform.membership_scopes.membership_id
         and m.organization_id = any (platform.current_org_ids())
    )
  );

-- ---- permissions -----------------------------------------------------
--
-- Catalogue de r\xE9f\xE9rence : lisible par tout utilisateur authentifi\xE9
-- (l'interface s'en sert pour construire les \xE9crans de r\xF4les).
-- \xC9criture : migrations uniquement.
drop policy if exists permissions_select on platform.permissions;
create policy permissions_select on platform.permissions
  for select to authenticated
  using (true);

-- ---- roles -----------------------------------------------------------
drop policy if exists roles_select on platform.roles;
create policy roles_select on platform.roles
  for select to authenticated
  using (organization_id is null                                -- r\xF4les syst\xE8me
         or organization_id = any (platform.current_org_ids())); -- r\xF4les maison

-- R\xF4les personnalis\xE9s : cr\xE9ation et modification avec \`role.manage\`.
-- Les r\xF4les syst\xE8me (organization_id null, is_system) restent intouchables.
drop policy if exists roles_insert on platform.roles;
create policy roles_insert on platform.roles
  for insert to authenticated
  with check (
        organization_id is not null
    and not is_system
    and platform.has_permission(organization_id, 'role.manage')
    -- on ne cr\xE9e pas un r\xF4le plus puissant que le sien
    and rank > coalesce(platform.current_role_rank(organization_id), 1000)
  );

drop policy if exists roles_update on platform.roles;
create policy roles_update on platform.roles
  for update to authenticated
  using (
        organization_id is not null
    and not is_system
    and platform.has_permission(organization_id, 'role.manage')
    and rank > coalesce(platform.current_role_rank(organization_id), 1000)
  )
  with check (
        organization_id is not null
    and not is_system
    and platform.has_permission(organization_id, 'role.manage')
    and rank > coalesce(platform.current_role_rank(organization_id), 1000)
  );

drop policy if exists roles_delete on platform.roles;
create policy roles_delete on platform.roles
  for delete to authenticated
  using (
        organization_id is not null
    and not is_system
    and platform.has_permission(organization_id, 'role.manage')
    and rank > coalesce(platform.current_role_rank(organization_id), 1000)
  );

-- ---- role_permissions ------------------------------------------------
drop policy if exists role_permissions_select on platform.role_permissions;
create policy role_permissions_select on platform.role_permissions
  for select to authenticated
  using (
    exists (
      select 1
        from platform.roles r
       where r.id = platform.role_permissions.role_id
         and (r.organization_id is null
              or r.organization_id = any (platform.current_org_ids()))
    )
  );

-- \xC9criture : uniquement sur un r\xF4le maison moins puissant que le sien.
-- Un membre ne peut donc pas s'octroyer indirectement une permission en
-- l'ajoutant \xE0 son propre r\xF4le.
drop policy if exists role_permissions_insert on platform.role_permissions;
create policy role_permissions_insert on platform.role_permissions
  for insert to authenticated
  with check (
    exists (
      select 1
        from platform.roles r
       where r.id = platform.role_permissions.role_id
         and r.organization_id is not null
         and not r.is_system
         and platform.has_permission(r.organization_id, 'role.manage')
         and r.rank > coalesce(platform.current_role_rank(r.organization_id), 1000)
         -- et on ne d\xE9l\xE8gue que ce que l'on d\xE9tient soi-m\xEAme
         and platform.has_permission(r.organization_id,
                                     platform.role_permissions.permission_key)
    )
  );

drop policy if exists role_permissions_delete on platform.role_permissions;
create policy role_permissions_delete on platform.role_permissions
  for delete to authenticated
  using (
    exists (
      select 1
        from platform.roles r
       where r.id = platform.role_permissions.role_id
         and r.organization_id is not null
         and not r.is_system
         and platform.has_permission(r.organization_id, 'role.manage')
         and r.rank > coalesce(platform.current_role_rank(r.organization_id), 1000)
    )
  );

-- ---------------------------------------------------------------------
--  Droits de table (la RLS filtre ensuite les lignes)
-- ---------------------------------------------------------------------
grant select on platform.organizations, platform.organization_settings,
                platform.users_profile, platform.memberships,
                platform.membership_scopes, platform.permissions,
                platform.roles, platform.role_permissions
  to authenticated;

grant update on platform.organizations, platform.organization_settings to authenticated;
grant insert, update, delete on platform.roles to authenticated;
grant insert, delete on platform.role_permissions to authenticated;

-- users_profile, memberships, membership_scopes : aucun droit d'\xE9criture.
-- Leurs mutations passent par les RPC SECURITY DEFINER (P0005).
`},{name:"platform/P0005__invitations.sql",sql:`-- =====================================================================
--  P0005 \u2014 Invitations, d\xE9l\xE9gation hi\xE9rarchique et gestion des membres
--
--  \u26A0\uFE0F Le\xE7on GesSchool 032-A, la plus dangereuse des six.
--
--     La migration 029 avait pos\xE9 sur \`invitations\` une policy \`for all\` :
--       using (ecole_id = ecole_courante() or est_super_admin())
--     N'importe quel membre de l'\xE9cole pouvait donc INS\xC9RER une invitation
--     de N'IMPORTE QUEL r\xF4le, puis l'utiliser \u2192 escalade en administrateur.
--     Il pouvait aussi LIRE tous les codes en circulation.
--
--     Correctif appliqu\xE9 alors, et repris ici comme r\xE8gle de plateforme :
--       \u2022 lecture r\xE9serv\xE9e aux r\xF4les qui g\xE8rent les membres ;
--       \u2022 AUCUNE policy d'\xE9criture \u2014 les mutations passent uniquement par
--         des RPC SECURITY DEFINER qui appliquent la d\xE9l\xE9gation.
--
--  G\xE9n\xE9ralisation de la matrice 029 (\`_peut_inviter\`) :
--     GesSchool \xE9num\xE9rait les couples autoris\xE9s (admin_ecole \u2192 direction,
--     rh \u2192 secretaire\u2026). Ici, la r\xE8gle est unique et vaut pour tout r\xF4le,
--     pr\xE9sent ou futur :
--
--       ON NE G\xC8RE QUE DES R\xD4LES STRICTEMENT MOINS PUISSANTS QUE LE SIEN
--       (rank cible > rank de l'appelant)
--
--     Ajouter un r\xF4le ne demande plus de toucher \xE0 une matrice.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. INVITATIONS
-- ---------------------------------------------------------------------
create table if not exists platform.invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  role_id         uuid not null references platform.roles(id) on delete restrict,

  code            text not null unique,
  email           text,                       -- si renseign\xE9, verrou \xE0 cet email

  status          platform.invitation_status not null default 'active',
  expires_at      timestamptz not null default (now() + interval '14 days'),

  invited_by      uuid references auth.users(id) on delete set null,
  used_by         uuid references auth.users(id) on delete set null,
  used_at         timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table platform.invitations is
  'Invitations \xE0 rejoindre une organisation. AUCUNE \xE9criture directe : '
  'RPC SECURITY DEFINER uniquement (le\xE7on GesSchool 032-A).';
comment on column platform.invitations.email is
  'Si renseign\xE9, seul ce courriel peut consommer le code (verrou 030).';

create index if not exists idx_invitations_org
  on platform.invitations (organization_id, status);
create index if not exists idx_invitations_code
  on platform.invitations (code) where status = 'active';

alter table platform.invitations enable row level security;

select platform.attach_updated_at('platform', 'invitations');
select platform.attach_org_immutability('platform', 'invitations');

-- Lecture r\xE9serv\xE9e \xE0 ceux qui g\xE8rent les membres. Aucune policy d'\xE9criture.
drop policy if exists invitations_select on platform.invitations;
create policy invitations_select on platform.invitations
  for select to authenticated
  using (platform.has_permission(organization_id, 'member.invite')
         or platform.has_permission(organization_id, 'member.manage'));

grant select on platform.invitations to authenticated;
-- Pas de grant insert/update/delete : \xE9criture impossible hors RPC.

-- ---------------------------------------------------------------------
--  2. GARDE-FOU DE D\xC9L\xC9GATION
-- ---------------------------------------------------------------------
--
-- C\u0153ur de la r\xE8gle. V\xE9rifie que l'appelant peut agir sur un r\xF4le donn\xE9 :
--   \u2022 il est membre actif de l'organisation ;
--   \u2022 il d\xE9tient la permission demand\xE9e ;
--   \u2022 le r\xF4le cible est STRICTEMENT moins puissant que le sien.
--
-- L\xE8ve une exception explicite plut\xF4t que de renvoyer false : l'appelant
-- re\xE7oit un message actionnable, et l'\xE9chec est visible dans les journaux.
-- Une signature \xE0 param\xE8tre par d\xE9faut ne REMPLACE pas la pr\xE9c\xE9dente : elle
-- s'y ajoute. Pire, un appel \xE0 3 arguments trouve alors une correspondance
-- EXACTE sur l'ancienne forme et l'emporte silencieusement sur la nouvelle \u2014
-- la migration semble appliqu\xE9e, mais l'ancienne logique continue de tourner.
--
-- On retire donc TOUTES les surcharges par leur nom, quelle que soit leur
-- signature, plut\xF4t qu'une signature devin\xE9e.
do $$
declare v_sig text;
begin
  for v_sig in
    select p.oid::regprocedure::text
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'platform'
       and p.proname = 'assert_can_delegate'
  loop
    execute 'drop function if exists ' || v_sig;
  end loop;
end $$;

create or replace function platform.assert_can_delegate(
  p_organization_id  uuid,
  p_role_id          uuid,
  p_permission_key   text,
  p_allow_equal_rank boolean default false
)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_my_rank     integer;
  v_target_rank integer;
  v_target_org  uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.' using errcode = '42501';
  end if;

  if not platform.has_permission(p_organization_id, p_permission_key) then
    raise exception 'Permission % requise.', p_permission_key
      using errcode = '42501';
  end if;

  select rank, organization_id
    into v_target_rank, v_target_org
    from platform.roles
   where id = p_role_id;

  if v_target_rank is null then
    raise exception 'R\xF4le introuvable.' using errcode = 'P0002';
  end if;

  -- Un r\xF4le maison ne peut \xEAtre utilis\xE9 que dans son organisation.
  if v_target_org is not null and v_target_org <> p_organization_id then
    raise exception 'Ce r\xF4le appartient \xE0 une autre organisation.'
      using errcode = '42501';
  end if;

  v_my_rank := platform.current_role_rank(p_organization_id);

  if v_my_rank is null then
    raise exception 'Vous n''\xEAtes pas membre actif de cette organisation.'
      using errcode = '42501';
  end if;

  -- Deux r\xE9gimes, et la distinction est d\xE9lib\xE9r\xE9e :
  --
  --   CR\xC9ER du pouvoir (inviter)  \u2192 in\xE9galit\xE9 STRICTE.
  --      Nul ne fait entrer quelqu'un \xE0 son propre niveau ou au-dessus.
  --
  --   ADMINISTRER un membre existant (r\xF4le, statut, p\xE9rim\xE8tre)
  --                               \u2192 \xE9galit\xE9 TOL\xC9R\xC9E.
  --      Sans cela, deux propri\xE9taires ne pourraient jamais se g\xE9rer
  --      mutuellement : une organisation \xE0 deux propri\xE9taires deviendrait
  --      impossible \xE0 r\xE9organiser, et assert_not_last_owner() ne serait
  --      jamais atteint. Le verrou contre l'auto-promotion tient ailleurs :
  --      le r\xF4le vis\xE9 reste born\xE9 par le rang de l'appelant, et
  --      assert_not_self() interdit d'agir sur son propre membership.
  if (p_allow_equal_rank and v_target_rank < v_my_rank)
     or (not p_allow_equal_rank and v_target_rank <= v_my_rank) then
    raise exception
      'D\xE9l\xE9gation refus\xE9e : r\xF4le plus puissant que le v\xF4tre.'
      using errcode = '42501',
            hint = 'Rang du r\xF4le vis\xE9 : ' || v_target_rank
                   || ' ; votre rang : ' || v_my_rank
                   || case when p_allow_equal_rank
                           then ' (\xE9galit\xE9 autoris\xE9e).'
                           else ' (rang strictement inf\xE9rieur exig\xE9).' end;
  end if;
end $$;

comment on function platform.assert_can_delegate(uuid, uuid, text, boolean) is
  'Garde-fou de d\xE9l\xE9gation. In\xE9galit\xE9 stricte pour cr\xE9er du pouvoir (inviter), '
  '\xE9galit\xE9 tol\xE9r\xE9e pour administrer un membre existant. '
  'G\xE9n\xE9ralise la matrice _peut_inviter() de GesSchool 029.';

-- ---------------------------------------------------------------------
--  Interdiction d'agir sur son propre membership
-- ---------------------------------------------------------------------
--
-- Compl\xE9ment indispensable de l'\xE9galit\xE9 de rang : sans lui, un membre
-- pourrait modifier son propre r\xF4le ou son propre p\xE9rim\xE8tre. Et il \xE9vite
-- au passage l'auto-exclusion accidentelle.
create or replace function platform.assert_not_self(p_membership_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from platform.memberships
     where id = p_membership_id and user_id = auth.uid()
  ) then
    raise exception 'Vous ne pouvez pas modifier votre propre acc\xE8s.'
      using errcode = '42501',
            hint = 'Un autre membre de rang au moins \xE9gal doit le faire.';
  end if;
end $$;

-- ---------------------------------------------------------------------
--  3. PROTECTION DU DERNIER PROPRI\xC9TAIRE
-- ---------------------------------------------------------------------
--
-- Une organisation sans propri\xE9taire actif est inadministrable : plus
-- personne ne peut g\xE9rer la facturation ni r\xE9attribuer les r\xF4les.
create or replace function platform.assert_not_last_owner(p_membership_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_org      uuid;
  v_is_owner boolean;
  v_others   integer;
begin
  select m.organization_id, (r.key = 'owner' and r.is_system)
    into v_org, v_is_owner
    from platform.memberships m
    join platform.roles r on r.id = m.role_id
   where m.id = p_membership_id;

  if not coalesce(v_is_owner, false) then
    return;
  end if;

  select count(*)
    into v_others
    from platform.memberships m
    join platform.roles r on r.id = m.role_id
   where m.organization_id = v_org
     and m.status = 'active'
     and r.is_system
     and r.key = 'owner'
     and m.id <> p_membership_id;

  if v_others = 0 then
    raise exception
      'Impossible : cette organisation resterait sans propri\xE9taire actif.'
      using errcode = '23514',
            hint = 'D\xE9signez d''abord un autre propri\xE9taire.';
  end if;
end $$;

-- ---------------------------------------------------------------------
--  4. RPC \u2014 inviter un membre
-- ---------------------------------------------------------------------
create or replace function platform.invite_member(
  p_organization_id uuid,
  p_role_id         uuid,
  p_email           text default null
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  perform platform.assert_can_delegate(p_organization_id, p_role_id, 'member.invite');

  -- Code court, lisible, transmissible par WhatsApp ou SMS.
  -- D\xE9riv\xE9 de gen_random_uuid(), natif de pg_catalog : aucune d\xE9pendance \xE0
  -- pgcrypto, dont le sch\xE9ma d'installation varie d'un h\xE9bergeur \xE0 l'autre.
  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into platform.invitations
    (organization_id, role_id, code, email, invited_by)
  values
    (p_organization_id, p_role_id, v_code, nullif(trim(p_email), ''), auth.uid());

  return v_code;
end $$;

comment on function platform.invite_member(uuid, uuid, text) is
  'Cr\xE9e une invitation et renvoie son code. Applique la d\xE9l\xE9gation par rang.';

-- ---------------------------------------------------------------------
--  5. RPC \u2014 accepter une invitation
-- ---------------------------------------------------------------------
--
-- Le verrou par email (le\xE7on GesSchool 030) \xE9vite qu'un code transmis par
-- erreur, ou intercept\xE9, soit consomm\xE9 par quelqu'un d'autre.
create or replace function platform.accept_invitation(p_code text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_inv        platform.invitations;
  v_user_email text;
  v_membership uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.' using errcode = '42501';
  end if;

  select * into v_inv
    from platform.invitations
   where code = upper(trim(p_code))
   for update;

  if not found then
    raise exception 'Code d''invitation inconnu.' using errcode = 'P0002';
  end if;

  if v_inv.status <> 'active' then
    raise exception 'Cette invitation n''est plus valable.' using errcode = '23514';
  end if;

  if v_inv.expires_at < now() then
    update platform.invitations set status = 'expired' where id = v_inv.id;
    raise exception 'Cette invitation a expir\xE9.' using errcode = '23514';
  end if;

  -- Verrou par email
  if v_inv.email is not null then
    select email into v_user_email from auth.users where id = auth.uid();
    if lower(coalesce(v_user_email, '')) <> lower(v_inv.email) then
      raise exception 'Cette invitation est r\xE9serv\xE9e \xE0 une autre adresse.'
        using errcode = '42501';
    end if;
  end if;

  insert into platform.memberships
    (user_id, organization_id, role_id, status, invited_by, joined_at)
  values
    (auth.uid(), v_inv.organization_id, v_inv.role_id, 'active', v_inv.invited_by, now())
  -- Dans ON CONFLICT DO UPDATE, la ligne existante se r\xE9f\xE9rence par le NOM
  -- de la table cible (\`memberships\`), jamais par sa forme sch\xE9ma-qualifi\xE9e.
  on conflict on constraint uq_memberships_user_org
    do update set status    = 'active',
                  joined_at = coalesce(memberships.joined_at, now())
  returning id into v_membership;

  update platform.invitations
     set status = 'used', used_by = auth.uid(), used_at = now()
   where id = v_inv.id;

  return v_membership;
end $$;

comment on function platform.accept_invitation(text) is
  'Consomme un code d''invitation et cr\xE9e le membership. Verrou par email (le\xE7on 030).';

-- ---------------------------------------------------------------------
--  6. RPC \u2014 r\xE9voquer une invitation
-- ---------------------------------------------------------------------
create or replace function platform.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org  uuid;
  v_role uuid;
begin
  select organization_id, role_id into v_org, v_role
    from platform.invitations where id = p_invitation_id;

  if v_org is null then
    raise exception 'Invitation introuvable.' using errcode = 'P0002';
  end if;

  perform platform.assert_can_delegate(v_org, v_role, 'member.invite');

  update platform.invitations
     set status = 'revoked'
   where id = p_invitation_id and status = 'active';
end $$;

-- ---------------------------------------------------------------------
--  7. RPC \u2014 changer le r\xF4le d'un membre
-- ---------------------------------------------------------------------
create or replace function platform.set_member_role(
  p_membership_id uuid,
  p_role_id       uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org          uuid;
  v_current_role uuid;
begin
  select organization_id, role_id into v_org, v_current_role
    from platform.memberships where id = p_membership_id;

  if v_org is null then
    raise exception 'Membre introuvable.' using errcode = 'P0002';
  end if;

  -- Deux v\xE9rifications, pas une : il faut pouvoir agir sur le r\xF4le ACTUEL
  -- du membre (on ne r\xE9trograde pas plus puissant que soi) ET attribuer
  -- le r\xF4le CIBLE. Ne contr\xF4ler que la cible laisserait un \`manager\`
  -- r\xE9trograder un \`owner\`.
  perform platform.assert_not_self(p_membership_id);
  perform platform.assert_can_delegate(v_org, v_current_role, 'member.manage', true);
  perform platform.assert_can_delegate(v_org, p_role_id,      'member.manage', true);
  perform platform.assert_not_last_owner(p_membership_id);

  update platform.memberships
     set role_id = p_role_id
   where id = p_membership_id;
end $$;

comment on function platform.set_member_role(uuid, uuid) is
  'Change le r\xF4le d''un membre. V\xE9rifie la d\xE9l\xE9gation sur le r\xF4le actuel ET le r\xF4le cible.';

-- ---------------------------------------------------------------------
--  8. RPC \u2014 suspendre, r\xE9activer ou r\xE9voquer un membre
-- ---------------------------------------------------------------------
create or replace function platform.set_member_status(
  p_membership_id uuid,
  p_status        platform.membership_status
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org  uuid;
  v_role uuid;
begin
  select organization_id, role_id into v_org, v_role
    from platform.memberships where id = p_membership_id;

  if v_org is null then
    raise exception 'Membre introuvable.' using errcode = 'P0002';
  end if;

  perform platform.assert_not_self(p_membership_id);
  perform platform.assert_can_delegate(v_org, v_role, 'member.manage', true);

  if p_status <> 'active' then
    perform platform.assert_not_last_owner(p_membership_id);
  end if;

  update platform.memberships
     set status = p_status
   where id = p_membership_id;
end $$;

-- ---------------------------------------------------------------------
--  9. RPC \u2014 d\xE9finir le p\xE9rim\xE8tre d'un membre
-- ---------------------------------------------------------------------
--
-- Remplace int\xE9gralement le p\xE9rim\xE8tre d'un type donn\xE9.
-- Un tableau vide L\xC8VE la restriction (acc\xE8s complet \xE0 ce type) \u2014 c'est la
-- s\xE9mantique de in_scope(), et elle doit rester explicite c\xF4t\xE9 appelant.
create or replace function platform.set_member_scopes(
  p_membership_id uuid,
  p_scope_type    text,
  p_scope_ids     uuid[]
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org  uuid;
  v_role uuid;
begin
  select organization_id, role_id into v_org, v_role
    from platform.memberships where id = p_membership_id;

  if v_org is null then
    raise exception 'Membre introuvable.' using errcode = 'P0002';
  end if;

  perform platform.assert_not_self(p_membership_id);
  perform platform.assert_can_delegate(v_org, v_role, 'member.manage', true);

  delete from platform.membership_scopes
   where membership_id = p_membership_id
     and scope_type    = p_scope_type;

  if p_scope_ids is not null and array_length(p_scope_ids, 1) > 0 then
    insert into platform.membership_scopes
      (membership_id, scope_type, scope_id, created_by)
    select p_membership_id, p_scope_type, unnest(p_scope_ids), auth.uid()
    on conflict on constraint uq_membership_scope do nothing;
  end if;
end $$;

comment on function platform.set_member_scopes(uuid, text, uuid[]) is
  'Remplace le p\xE9rim\xE8tre d''un membre pour un type donn\xE9. '
  'Tableau vide = restriction lev\xE9e (acc\xE8s complet \xE0 ce type).';

-- ---------------------------------------------------------------------
--  Exposition
-- ---------------------------------------------------------------------
revoke all on function platform.assert_can_delegate(uuid, uuid, text, boolean) from public;
revoke all on function platform.assert_not_last_owner(uuid)                    from public;
revoke all on function platform.assert_not_self(uuid)                          from public;

revoke all on function platform.invite_member(uuid, uuid, text)        from public;
revoke all on function platform.accept_invitation(text)                from public;
revoke all on function platform.revoke_invitation(uuid)                from public;
revoke all on function platform.set_member_role(uuid, uuid)            from public;
revoke all on function platform.set_member_status(uuid, platform.membership_status) from public;
revoke all on function platform.set_member_scopes(uuid, text, uuid[])  from public;

grant execute on function platform.invite_member(uuid, uuid, text)     to authenticated;
grant execute on function platform.accept_invitation(text)             to authenticated;
grant execute on function platform.revoke_invitation(uuid)             to authenticated;
grant execute on function platform.set_member_role(uuid, uuid)         to authenticated;
grant execute on function platform.set_member_status(uuid, platform.membership_status) to authenticated;
grant execute on function platform.set_member_scopes(uuid, text, uuid[]) to authenticated;

-- ---------------------------------------------------------------------
--  MARQUEUR DE VERSION
-- ---------------------------------------------------------------------
--
-- R\xE9pond \xE0 une question qu'on ne peut pas trancher en lisant le code source :
-- \xAB la base fait-elle bien tourner la version que j'ai sous les yeux ? \xBB
--
-- Un message d'erreur inattendu vient plus souvent d'une migration non
-- rejou\xE9e que d'un d\xE9faut de logique. Ce marqueur le dit en une requ\xEAte :
--     select platform.socle_version();
--
-- \xC0 incr\xE9menter \xE0 chaque modification d'une migration P0001\u2013P0005.
create or replace function platform.socle_version()
returns text
language sql
immutable
as $$ select 'P0001-P0005 \xB7 build 2026-08-01.5' $$;

comment on function platform.socle_version() is
  'Version du socle r\xE9ellement d\xE9ploy\xE9e. Comparer avec le d\xE9p\xF4t avant de '
  'conclure \xE0 un d\xE9faut de logique.';

grant execute on function platform.socle_version() to authenticated;
`},{name:"platform/P0006__audit_log.sql",sql:`-- =====================================================================
--  P0006 \u2014 Journal d'audit append-only
--
--  R\xE9pond \xE0 trois questions, et \xE0 elles seules : QUI a fait QUOI, QUAND.
--
--  \u26A0\uFE0F Le\xE7on GesSchool 032. Les correctifs de s\xE9curit\xE9 de cette migration
--     ont \xE9t\xE9 trouv\xE9s par un audit MANUEL du code. Sans journal, on ne
--     pouvait pas r\xE9pondre \xE0 la question qui suit imm\xE9diatement toute
--     d\xE9couverte de faille : \xAB a-t-elle \xE9t\xE9 exploit\xE9e, et par qui ? \xBB.
--     Un socle qui emp\xEAche l'escalade sans en garder trace est \xE0 moiti\xE9 fait.
--
--  Deux exigences qui gouvernent la conception :
--
--    1. APPEND-ONLY, y compris pour le client. Un journal modifiable par
--       celui qu'il surveille ne vaut rien. Verrouill\xE9 par trigger, pas
--       seulement par l'absence de droits.
--
--    2. Les actions de support GesPro sont trac\xE9es comme les autres, et
--       marqu\xE9es comme telles. \`is_platform_admin\` ouvre des portes : il
--       doit laisser des traces.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. LE JOURNAL
-- ---------------------------------------------------------------------
create table if not exists platform.audit_log (
  -- bigserial et non uuid : un journal se lit par ordre d'insertion, et
  -- l'ordre naturel \xE9vite un index suppl\xE9mentaire sur des volumes \xE9lev\xE9s.
  id             bigserial primary key,

  occurred_at    timestamptz not null default now(),

  -- Nullable : certaines actions n'appartiennent \xE0 aucune organisation
  -- (support plateforme, t\xE2ches planifi\xE9es).
  organization_id uuid,

  actor_id       uuid,                    -- auth.uid() au moment de l'action
  actor_is_admin boolean not null default false,  -- action de support GesPro

  action         text not null check (action in ('insert', 'update', 'delete')),
  schema_name    text not null,
  table_name     text not null,

  -- text et non uuid : toute table n'a pas une cl\xE9 primaire uuid.
  row_id         text,

  old_data       jsonb,
  new_data       jsonb,
  changed_fields text[]
);

comment on table platform.audit_log is
  'Journal append-only. Ni modifiable ni supprimable, y compris par le client.';
comment on column platform.audit_log.actor_is_admin is
  'Action r\xE9alis\xE9e sous le drapeau support GesPro. \xC0 surveiller en revue.';

create index if not exists idx_audit_org_time
  on platform.audit_log (organization_id, occurred_at desc);
create index if not exists idx_audit_table_row
  on platform.audit_log (schema_name, table_name, row_id);
create index if not exists idx_audit_actor
  on platform.audit_log (actor_id, occurred_at desc);
-- Les actions de support sont rares : un index partiel suffit et co\xFBte peu.
create index if not exists idx_audit_admin_actions
  on platform.audit_log (occurred_at desc) where actor_is_admin;

alter table platform.audit_log enable row level security;

-- ---------------------------------------------------------------------
--  2. VERROU APPEND-ONLY
-- ---------------------------------------------------------------------
--
-- Retirer les droits ne suffit pas : le propri\xE9taire de la table les
-- contourne, et une future migration pourrait les rendre par m\xE9garde.
-- Le trigger, lui, refuse quoi qu'il arrive.
create or replace function platform.forbid_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Le journal d''audit est append-only (tentative de %).', tg_op
    using errcode = '42501',
          hint = 'Une entr\xE9e d''audit ne se corrige pas : elle se compl\xE8te.';
end $$;

drop trigger if exists trg_audit_log_immutable on platform.audit_log;
create trigger trg_audit_log_immutable
  before update or delete or truncate on platform.audit_log
  for each statement execute function platform.forbid_audit_mutation();

-- ---------------------------------------------------------------------
--  3. LE TRIGGER G\xC9N\xC9RIQUE
-- ---------------------------------------------------------------------
--
-- Une seule fonction pour toutes les tables, de la plateforme comme des
-- produits. Elle lit \`organization_id\` dans la ligne si la colonne existe,
-- sans la conna\xEEtre \xE0 l'avance.
create or replace function platform.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old     jsonb;
  v_new     jsonb;
  v_org     uuid;
  v_row_id  text;
  v_changed text[];
begin
  v_old := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;

  -- Sur UPDATE, ne consigner que si quelque chose a r\xE9ellement chang\xE9.
  -- Sans ce filtre, un \`update ... set x = x\` polluerait le journal, et
  -- les triggers updated_at g\xE9n\xE8rent beaucoup d'\xE9critures sans port\xE9e.
  if tg_op = 'UPDATE' then
    select array_agg(key order by key)
      into v_changed
      from jsonb_each(v_new)
     where v_new -> key is distinct from v_old -> key
       and key <> 'updated_at';

    if v_changed is null then
      return null;   -- trigger AFTER : la valeur de retour est ignor\xE9e
    end if;
  end if;

  v_org := nullif(coalesce(v_new, v_old) ->> 'organization_id', '')::uuid;
  v_row_id := coalesce(v_new, v_old) ->> 'id';

  insert into platform.audit_log (
    organization_id, actor_id, actor_is_admin,
    action, schema_name, table_name, row_id,
    old_data, new_data, changed_fields
  ) values (
    v_org,
    auth.uid(),
    coalesce(platform.is_platform_admin(), false),
    lower(tg_op),
    tg_table_schema,
    tg_table_name,
    v_row_id,
    v_old,
    v_new,
    v_changed
  );

  return null;
end $$;

comment on function platform.audit_trigger() is
  'Trigger g\xE9n\xE9rique d''audit. Lit organization_id dans la ligne si pr\xE9sent. '
  'Ignore les UPDATE sans changement r\xE9el (hors updated_at).';

-- ---------------------------------------------------------------------
--  4. POSE DU TRIGGER
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F \xC0 poser sur les tables SENSIBLES, pas sur toutes. Chaque ligne audit\xE9e
--    est une \xE9criture suppl\xE9mentaire : sur une table de mouvements de stock
--    ou de pointages, le journal d\xE9passerait vite la table elle-m\xEAme.
--    Auditer les d\xE9cisions (droits, argent, identit\xE9), pas le flux.
create or replace function platform.attach_audit(p_schema text, p_table text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  execute format('drop trigger if exists trg_%1$s_audit on %2$I.%1$I',
                 p_table, p_schema);
  execute format(
    'create trigger trg_%1$s_audit after insert or update or delete on %2$I.%1$I '
    || 'for each row execute function platform.audit_trigger()',
    p_table, p_schema);
end $$;

comment on function platform.attach_audit(text, text) is
  'Pose l''audit sur une table. R\xE9server aux tables sensibles : droits, '
  'argent, identit\xE9. Pas aux tables de flux.';

revoke all on function platform.attach_audit(text, text) from public;

-- Tables de la plateforme dont toute modification doit \xEAtre tra\xE7able :
-- ce sont celles qui d\xE9cident QUI peut faire QUOI.
select platform.attach_audit('platform', 'memberships');
select platform.attach_audit('platform', 'membership_scopes');
select platform.attach_audit('platform', 'roles');
select platform.attach_audit('platform', 'role_permissions');
select platform.attach_audit('platform', 'invitations');
select platform.attach_audit('platform', 'organizations');
select platform.attach_audit('platform', 'organization_settings');

-- ---------------------------------------------------------------------
--  5. LECTURE
-- ---------------------------------------------------------------------
--
-- Lecture r\xE9serv\xE9e \xE0 \`audit.read\`. Aucune policy d'\xE9criture : les entr\xE9es
-- ne naissent que du trigger, qui est SECURITY DEFINER.
drop policy if exists audit_log_select on platform.audit_log;
create policy audit_log_select on platform.audit_log
  for select to authenticated
  using (
        (organization_id is not null
         and platform.has_permission(organization_id, 'audit.read'))
    or  platform.is_platform_admin()
  );

grant select on platform.audit_log to authenticated;
-- Ni insert, ni update, ni delete : volontaire.

-- Le journal ne doit pas non plus \xEAtre vid\xE9 par r\xE9initialisation de s\xE9quence.
revoke all on sequence platform.audit_log_id_seq from public, authenticated;

-- ---------------------------------------------------------------------
--  6. CONSULTATION D'UNE LIGNE
-- ---------------------------------------------------------------------
--
-- \xAB Qui a touch\xE9 \xE0 cette facture ? \xBB \u2014 la question la plus fr\xE9quente en
-- support. Une fonction \xE9vite de r\xE9\xE9crire la jointure \xE0 chaque fois.
create or replace function platform.audit_history(
  p_schema   text,
  p_table    text,
  p_row_id   text,
  p_limit    integer default 50
)
returns table (
  occurred_at    timestamptz,
  actor          text,
  is_admin       boolean,
  action         text,
  changed_fields text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.occurred_at,
         coalesce(p.full_name, a.actor_id::text, '(syst\xE8me)'),
         a.actor_is_admin,
         a.action,
         a.changed_fields
    from platform.audit_log a
    left join platform.users_profile p on p.id = a.actor_id
   where a.schema_name = p_schema
     and a.table_name  = p_table
     and a.row_id      = p_row_id
     and (
           (a.organization_id is not null
            and platform.has_permission(a.organization_id, 'audit.read'))
        or platform.is_platform_admin()
         )
   order by a.occurred_at desc
   limit least(coalesce(p_limit, 50), 500);
$$;

comment on function platform.audit_history(text, text, text, integer) is
  'Historique d''une ligne. Applique le m\xEAme contr\xF4le que la policy de lecture.';

revoke all on function platform.audit_history(text, text, text, integer) from public;
grant execute on function platform.audit_history(text, text, text, integer) to authenticated;
`},{name:"platform/P0012__soft_delete_and_sync.sql",sql:`-- =====================================================================
--  P0012 \u2014 Suppression logique et curseurs de synchronisation
--
--  Pr\xE9requis structurels du mode hors ligne (\xA711 du document
--  d'architecture). Num\xE9rot\xE9e P0012 pour tenir la place des migrations
--  fonctionnelles P0007\u2013P0011, \xE9crites plus tard : celle-ci touche TOUTES
--  les tables, et r\xE9trofiter une suppression logique apr\xE8s la mise en
--  production de GesClean co\xFBterait bien plus cher que de la poser ici.
--
--  ---------------------------------------------------------------------
--  LE PROBL\xC8ME QU'ELLE R\xC9SOUT
--
--  Un client hors ligne synchronise en demandant \xAB qu'est-ce qui a chang\xE9
--  depuis ma derni\xE8re visite ? \xBB. Une cr\xE9ation ou une modification se
--  d\xE9tecte par \`updated_at\`. Une SUPPRESSION PHYSIQUE, elle, ne laisse
--  rien : la ligne a disparu, et le client n'a aucun moyen de l'apprendre.
--  Il garderait ind\xE9finiment un \xE9l\xE8ve radi\xE9, un site perdu, un article
--  retir\xE9 du catalogue.
--
--  D'o\xF9 la r\xE8gle : dans un produit synchronisable, on ne supprime pas,
--  on marque \`deleted_at\`. La ligne devient une pierre tombale que la
--  synchronisation peut propager.
--
--  ---------------------------------------------------------------------
--  D\xC9CISION : LA RLS NE FILTRE PAS \`deleted_at\`
--
--  Tentant, mais faux : si les policies masquaient les lignes supprim\xE9es,
--  la synchronisation ne les verrait pas non plus \u2014 on retomberait
--  exactement sur le probl\xE8me qu'on cherche \xE0 r\xE9soudre.
--
--  Le filtrage appartient donc \xE0 la couche applicative (repository) ou \xE0
--  une vue \`v_<table>\`. La RLS ne gouverne que la VISIBILIT\xC9 PAR TENANT,
--  jamais l'\xE9tat m\xE9tier d'une ligne.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. POSE DE LA SUPPRESSION LOGIQUE
-- ---------------------------------------------------------------------
create or replace function platform.attach_soft_delete(p_schema text, p_table text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  execute format(
    'alter table %I.%I add column if not exists deleted_at timestamptz',
    p_schema, p_table);

  -- Index partiel : l'\xE9crasante majorit\xE9 des requ\xEAtes ne veut QUE les
  -- lignes vivantes. Un index sur toute la colonne co\xFBterait sans servir.
  execute format(
    'create index if not exists idx_%1$s_alive on %2$I.%1$I (id) '
    || 'where deleted_at is null',
    p_table, p_schema);
end $$;

comment on function platform.attach_soft_delete(text, text) is
  'Ajoute deleted_at et son index partiel. Idempotent. '
  'Exige une colonne \`id\` : les tables de jonction en sont dispens\xE9es.';

revoke all on function platform.attach_soft_delete(text, text) from public;

-- Tables plateforme repr\xE9sentant des entit\xE9s durables, susceptibles d'\xEAtre
-- mises en cache par un client hors ligne.
--
-- Volontairement exclues :
--   organization_settings  1:1 avec l'organisation, jamais supprim\xE9e seule
--   role_permissions       table de jonction, sans \`id\` ni existence propre
--   permissions            catalogue livr\xE9 par migration
--   audit_log              append-only par construction (P0006)
--   sync_state             \xE9tat local, pas donn\xE9e m\xE9tier
select platform.attach_soft_delete('platform', 'users_profile');
select platform.attach_soft_delete('platform', 'memberships');
select platform.attach_soft_delete('platform', 'membership_scopes');
select platform.attach_soft_delete('platform', 'roles');
select platform.attach_soft_delete('platform', 'invitations');
-- organizations porte d\xE9j\xE0 deleted_at depuis P0002 ; on pose l'index.
select platform.attach_soft_delete('platform', 'organizations');

-- ---------------------------------------------------------------------
--  2. CURSEURS DE SYNCHRONISATION
-- ---------------------------------------------------------------------
--
-- Un curseur par (utilisateur, appareil, table). L'appareil compte : le
-- m\xEAme utilisateur peut avoir une tablette de terrain et un poste de
-- bureau, chacun avec sa propre avance de synchronisation.
create table if not exists platform.sync_state (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references platform.organizations(id) on delete cascade,

  -- Identifiant stable g\xE9n\xE9r\xE9 par l'application \xE0 la premi\xE8re installation.
  device_id       text not null check (length(device_id) between 8 and 128),

  table_name      text not null check (table_name ~ '^[a-z][a-z0-9_]*$'),

  -- Borne du dernier tirage r\xE9ussi. Le client redemande tout ce dont
  -- \`updated_at\` est post\xE9rieur \u2014 pierres tombales comprises.
  last_pulled_at  timestamptz not null default '-infinity',

  -- Diagnostic : sans ces deux colonnes, un appareil qui d\xE9croche est
  -- invisible jusqu'\xE0 ce que l'utilisateur se plaigne.
  last_success_at timestamptz,
  last_error      text,
  failure_count   integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint uq_sync_state unique (user_id, device_id, table_name)
);

comment on table platform.sync_state is
  'Curseurs de synchronisation par utilisateur, appareil et table. '
  '\xC9tat local : ne se synchronise pas lui-m\xEAme.';
comment on column platform.sync_state.last_pulled_at is
  'Borne du dernier tirage r\xE9ussi. Le client redemande updated_at > cette valeur.';

create index if not exists idx_sync_state_device
  on platform.sync_state (user_id, device_id);
create index if not exists idx_sync_state_stale
  on platform.sync_state (organization_id, last_success_at)
  where failure_count > 0;

alter table platform.sync_state enable row level security;

select platform.attach_updated_at('platform', 'sync_state');
select platform.attach_org_immutability('platform', 'sync_state');

-- ---------------------------------------------------------------------
--  3. POLICIES
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F Seule table du socle, avec users_profile, dont la policy compare \xE0
--    auth.uid() \u2014 et c'est ici la s\xE9mantique exacte : mon curseur est le
--    mien. Un curseur partag\xE9 entre membres n'aurait aucun sens, et un
--    membre pouvant \xE9crire celui d'un autre pourrait le faire r\xE9gresser
--    pour lui masquer des donn\xE9es.
drop policy if exists sync_state_self on platform.sync_state;
create policy sync_state_self on platform.sync_state
  for all to authenticated
  using      (user_id = auth.uid()
              and organization_id = any (platform.current_org_ids()))
  with check (user_id = auth.uid()
              and organization_id = any (platform.current_org_ids()));

grant select, insert, update, delete on platform.sync_state to authenticated;

-- ---------------------------------------------------------------------
--  4. PURGE DU CACHE \u2014 le pendant de la suspension
-- ---------------------------------------------------------------------
--
-- \u26A0\uFE0F Le socle rend la suspension effective en base (le\xE7on GesSchool 032-D) :
--    un membre suspendu obtient un current_org_ids() vide. Cette garantie
--    S'ARR\xCATE \xC0 L'APPAREIL HORS LIGNE. Un agent r\xE9voqu\xE9 le lundi, dont la
--    tablette ne se reconnecte que le vendredi, lit son cache toute la
--    semaine.
--
--    Effacer le curseur force l'appareil \xE0 repartir de z\xE9ro \xE0 la prochaine
--    connexion \u2014 et donc \xE0 constater qu'il n'a plus acc\xE8s \xE0 rien. C'est le
--    volet base de donn\xE9es ; il ne dispense NI du chiffrement local,
--    NI de la dur\xE9e de vie du cache c\xF4t\xE9 application (\xA711.6).
create or replace function platform.invalidate_device_cache(p_user_id uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare v_count integer;
begin
  delete from platform.sync_state where user_id = p_user_id;
  get diagnostics v_count = row_count;
  return v_count;
end $$;

comment on function platform.invalidate_device_cache(uuid) is
  'Efface les curseurs d''un utilisateur : ses appareils repartent de z\xE9ro. '
  '\xC0 appeler \xE0 toute r\xE9vocation, suspension ou changement de p\xE9rim\xE8tre.';

revoke all on function platform.invalidate_device_cache(uuid) from public;

-- D\xE9clenchement automatique : d\xE8s qu'un membership cesse d'\xEAtre actif, ou
-- que son r\xF4le change, les caches de l'utilisateur deviennent suspects.
create or replace function platform.on_membership_access_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     or new.role_id is distinct from old.role_id then
    perform platform.invalidate_device_cache(new.user_id);
  end if;
  return new;
end $$;

drop trigger if exists trg_memberships_invalidate_cache on platform.memberships;
create trigger trg_memberships_invalidate_cache
  after update on platform.memberships
  for each row execute function platform.on_membership_access_change();

-- Un changement de p\xE9rim\xE8tre est tout aussi invalidant : le cache contient
-- des lignes que le membre n'a plus le droit de voir.
create or replace function platform.on_scope_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_user uuid;
begin
  select user_id into v_user
    from platform.memberships
   where id = coalesce(new.membership_id, old.membership_id);

  if v_user is not null then
    perform platform.invalidate_device_cache(v_user);
  end if;
  return null;
end $$;

drop trigger if exists trg_scopes_invalidate_cache on platform.membership_scopes;
create trigger trg_scopes_invalidate_cache
  after insert or update or delete on platform.membership_scopes
  for each row execute function platform.on_scope_change();

-- ---------------------------------------------------------------------
--  5. CONTR\xD4LE DE DISCIPLINE
-- ---------------------------------------------------------------------
--
-- Liste les tables m\xE9tier qui ne pourraient pas propager leurs
-- suppressions. Consomm\xE9e par le test pgTAP et par la CI.
create or replace function platform.tables_without_soft_delete()
returns table (schema_name text, table_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select n.nspname::text, c.relname::text
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relkind = 'r'
     and c.relname not like 'pg_%'
     -- Une table de jonction pure n'a pas d'existence propre : elle
     -- dispara\xEEt avec ses parents et n'a rien \xE0 synchroniser seule.
     and exists (
       select 1 from pg_attribute a
        where a.attrelid = c.oid and a.attname = 'id'
          and a.attnum > 0 and not a.attisdropped
     )
     and not exists (
       select 1 from pg_attribute a
        where a.attrelid = c.oid and a.attname = 'deleted_at'
          and a.attnum > 0 and not a.attisdropped
     );
$$;

comment on function platform.tables_without_soft_delete() is
  'Tables m\xE9tier incapables de propager une suppression \xE0 un client hors ligne.';

-- ---------------------------------------------------------------------
--  MARQUEUR DE VERSION
-- ---------------------------------------------------------------------
create or replace function platform.socle_version()
returns text
language sql
immutable
as $$ select 'P0001-P0006 + P0012 \xB7 build 2026-08-01.6' $$;
`},{name:"platform/P0013__onboarding_et_defauts.sql",sql:`-- =====================================================================
--  P0013 \u2014 Onboarding : ce que la migration de GesClean a co\xFBt\xE9
--
--  Trois fonctions remont\xE9es du produit vers le socle. Chacune corrige un
--  incident R\xC9EL survenu le 02/08/2026 pendant la bascule de GesClean en
--  production. Sans elles, GesHotel, GesShop et GesDocs rencontreront
--  exactement les trois m\xEAmes murs, dans le m\xEAme ordre.
--
--    1. backfill_users_profile()
--       \`current_org_ids()\` joint users_profile, aliment\xE9e par un trigger
--       qui ne se d\xE9clenche QU'\xC0 L'INSCRIPTION. Les comptes ant\xE9rieurs \xE0
--       l'installation du socle n'y ont aucune ligne \u2192 tableau vide \u2192
--       toutes les policies refusent. Application hors service, sans que
--       rien dans la structure ne paraisse anormal.
--
--    2. set_organization_id_default()
--       \`organization_id NOT NULL\` casse toute insertion d'une application
--       existante, qui ne conna\xEEt pas encore la colonne. Corriger le
--       client demanderait une livraison ; le trigger d\xE9bloque
--       imm\xE9diatement \u2014 et reste utile apr\xE8s : une valeur d\xE9duite du
--       contexte d'authentification est plus fiable qu'une valeur
--       transmise par le client, qui peut se tromper ou mentir.
--
--    3. provision_organization()
--       Une migration de reprise ne cr\xE9e d'organisation que pour les
--       comptes ayant d\xE9j\xE0 des donn\xE9es. Les comptes vides et TOUTES les
--       inscriptions futures restent bloqu\xE9s. R\xE9gression invisible tant
--       que personne ne s'inscrit.
--
--  \u26A0\uFE0F LE\xC7ON TRANSVERSE, la plus importante des trois :
--     les migrations s'ex\xE9cutent sous un r\xF4le non soumis \xE0 la RLS. Un
--     contr\xF4le qui v\xE9rifie la STRUCTURE \u2014 colonnes remplies, policies
--     pos\xE9es, triggers en place \u2014 passe alors m\xEAme que l'application est
--     hors service. Un contr\xF4le de migration doit s'ex\xE9cuter SOUS
--     L'IDENTIT\xC9 D'UN UTILISATEUR R\xC9EL : recalculer current_org_ids()
--     compte par compte, pas compter des lignes.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. Rattrapage des profils
-- ---------------------------------------------------------------------
create or replace function platform.backfill_users_profile()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare v_n integer;
begin
  insert into platform.users_profile (id, full_name, phone, locale)
  select u.id,
         coalesce(
           nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
           split_part(u.email, '@', 1)
         ),
         u.phone,
         'fr'
    from auth.users u
  on conflict (id) do nothing;

  get diagnostics v_n = row_count;
  return v_n;
end $$;

comment on function platform.backfill_users_profile() is
  'Cree les profils manquants pour les comptes anterieurs au socle. '
  'A EXECUTER SYSTEMATIQUEMENT apres installation sur une base existante.';


-- ---------------------------------------------------------------------
--  2. Remplissage automatique de organization_id
-- ---------------------------------------------------------------------
create or replace function platform.set_organization_id_default()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_orgs uuid[];
begin
  -- Valeur explicitement fournie : on n'y touche pas, la RLS la validera.
  if new.organization_id is not null then
    return new;
  end if;

  v_orgs := platform.current_org_ids();

  if array_length(v_orgs, 1) is null then
    raise exception 'Aucune organisation active pour cet utilisateur.'
      using errcode = '42501',
            hint = 'Compte suspendu, membership absent, ou profil non cr\xE9\xE9 '
                || '\u2014 voir platform.backfill_users_profile().';
  end if;

  if array_length(v_orgs, 1) > 1 then
    -- Deviner \xE9crirait dans la mauvaise organisation. Refuser est le
    -- seul comportement s\xFBr.
    raise exception
      'Membre de plusieurs organisations : organization_id doit \xEAtre fourni.'
      using errcode = '22004';
  end if;

  new.organization_id := v_orgs[1];
  return new;
end $$;

create or replace function platform.attach_org_default(p_schema text, p_table text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  execute format('drop trigger if exists trg_%1$s_org_default on %2$I.%1$I',
                 p_table, p_schema);
  execute format(
    'create trigger trg_%1$s_org_default before insert on %2$I.%1$I '
    || 'for each row execute function platform.set_organization_id_default()',
    p_table, p_schema);
end $$;

comment on function platform.attach_org_default(text, text) is
  'Renseigne organization_id a l''insertion. A poser sur TOUTE table '
  'metier, en complement de attach_org_immutability().';


-- ---------------------------------------------------------------------
--  3. Provisionnement d'une organisation
-- ---------------------------------------------------------------------
--
-- Deux chemins d'entr\xE9e, qui ne doivent jamais \xEAtre confondus :
--
--   inscription spontan\xE9e  \u2192  sa propre organisation, dont il est owner
--   coll\xE8gue invit\xE9        \u2192  rejoint une organisation existante
--
-- Les confondre, c'est soit bloquer les nouveaux clients, soit faire
-- entrer un inconnu dans les donn\xE9es d'autrui.
create or replace function platform.provision_organization(
  p_user_id uuid,
  p_product text,
  p_name    text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org   uuid;
  v_owner uuid;
  v_email text;
  v_name  text;
  v_slug  text;
begin
  -- D\xE9j\xE0 membre : un invit\xE9 garde l'organisation qui l'a invit\xE9 et n'en
  -- re\xE7oit surtout pas une seconde.
  if exists (select 1 from platform.memberships where user_id = p_user_id) then
    return null;
  end if;

  select email into v_email from auth.users where id = p_user_id;
  if v_email is null then
    raise exception 'Compte introuvable.' using errcode = 'P0002';
  end if;

  select id into v_owner from platform.roles where is_system and key = 'owner';

  -- Nom provisoire, corrigeable dans l'application. Mieux vaut un nom
  -- approximatif qu'un compte bloqu\xE9.
  v_name := coalesce(nullif(trim(p_name), ''), split_part(v_email, '@', 1));

  v_slug := translate(lower(v_name),
                      '\xE0\xE2\xE4\xE1\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\xFD\xFF',
                      'aaaaaaceeeeiiiinooooouuuuyy');
  v_slug := trim(both '-' from regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g'));
  if v_slug = '' then v_slug := 'org'; end if;
  if exists (select 1 from platform.organizations where slug = v_slug) then
    v_slug := v_slug || '-' || substr(replace(p_user_id::text, '-', ''), 1, 6);
  end if;

  insert into platform.organizations (slug, name, product, status)
  values (v_slug, v_name, p_product, 'trial')
  returning id into v_org;

  insert into platform.memberships
    (user_id, organization_id, role_id, status, joined_at)
  values (p_user_id, v_org, v_owner, 'active', now());

  return v_org;
end $$;

comment on function platform.provision_organization(uuid, text, text) is
  'Cree une organisation et son proprietaire. Sans effet si le compte est '
  'deja membre \u2014 un invite garde l''organisation qui l''a invite.';


-- ---------------------------------------------------------------------
--  Exposition
-- ---------------------------------------------------------------------
revoke all on function platform.backfill_users_profile()                from public;
revoke all on function platform.attach_org_default(text, text)          from public;
revoke all on function platform.provision_organization(uuid, text, text) from public;


-- ---------------------------------------------------------------------
--  Marqueur de version
-- ---------------------------------------------------------------------
create or replace function platform.socle_version()
returns text
language sql
immutable
as $$ select 'P0001-P0013 \xB7 build 2026-08-02.1' $$;
`},{name:"migrations/C0001__roles_permissions.sql",sql:`-- =====================================================================\r
--  C0001 \u2014 GesCatering : permissions et r\xF4les m\xE9tier\r
--\r
--  Le produit s'appuie sur le socle \`platform\` (gespro-db) et ne le\r
--  modifie pas : il y D\xC9CLARE ses permissions et ses r\xF4les.\r
--\r
--  R\xF4les (rang : plus bas = plus puissant, base de la d\xE9l\xE9gation) :\r
--    ops_director  25  Direction d'exploitation \u2014 VALIDE demandes et commandes\r
--    storekeeper   35  Magasinier \u2014 stock, r\xE9servations, r\xE9ceptions\r
--    purchasing    35  Achats \u2014 pr\xE9pare et passe les commandes\r
--    kitchen       40  Cuisine / production \u2014 planifie, consulte les fiches\r
--    requester     45  Service demandeur \u2014 cr\xE9e et suit ses demandes\r
--  owner (10) et admin (20) du socle re\xE7oivent toutes les permissions.\r
--\r
--  \u26A0\uFE0F S\xE9paration des t\xE2ches voulue :\r
--     - les achats PR\xC9PARENT une commande, la direction d'exploitation la\r
--       VALIDE, les achats la PASSENT. Personne d'autre que owner/admin ne\r
--       cumule pr\xE9paration et validation.\r
--     - un service demandeur n'a AUCUNE permission de stock ni d'achat :\r
--       c'est le sc\xE9nario 7 du cahier des charges, test\xE9 en base.\r
-- =====================================================================\r
\r
insert into platform.permissions (key, domain, action, label, description, product) values\r
  -- R\xE9f\xE9rentiel\r
  ('catalog.manage',     'catalog',    'manage',   'G\xE9rer le catalogue',\r
     'Produits, cat\xE9gories, unit\xE9s, conversions, fournisseurs, sites, services', 'gescatering'),\r
  ('catalog.read',       'catalog',    'read',     'Voir le catalogue', null, 'gescatering'),\r
  -- Stock\r
  ('stock.read',         'stock',      'read',     'Voir le stock', null, 'gescatering'),\r
  ('stock.move',         'stock',      'write',    'Enregistrer entr\xE9es, sorties et retours', null, 'gescatering'),\r
  ('stock.reserve',      'stock',      'write',    'R\xE9server et lib\xE9rer du stock', null, 'gescatering'),\r
  ('stock.adjust',       'stock',      'validate', 'Ajuster le stock (inventaire, correction)',\r
     'Motif obligatoire, op\xE9ration trac\xE9e', 'gescatering'),\r
  ('stock.transfer',     'stock',      'write',    'Transf\xE9rer du stock entre sites', null, 'gescatering'),\r
  -- Demandes internes\r
  ('request.create',     'request',    'write',    'Cr\xE9er une demande', null, 'gescatering'),\r
  ('request.read_all',   'request',    'read',     'Voir toutes les demandes', null, 'gescatering'),\r
  ('request.approve',    'request',    'validate', 'Valider ou refuser une demande', null, 'gescatering'),\r
  -- Production\r
  ('recipe.manage',      'recipe',     'manage',   'G\xE9rer les fiches techniques', null, 'gescatering'),\r
  ('recipe.validate',    'recipe',     'validate', 'Valider une fiche technique', null, 'gescatering'),\r
  ('production.plan',    'production', 'write',    'Planifier la production', null, 'gescatering'),\r
  ('production.approve', 'production', 'validate', 'Valider un planning de production', null, 'gescatering'),\r
  -- Prestations sp\xE9ciales\r
  ('event.manage',       'event',      'manage',   'G\xE9rer les prestations sp\xE9ciales', null, 'gescatering'),\r
  -- Approvisionnement\r
  ('need.transmit',      'need',       'write',    'Transmettre des besoins aux achats', null, 'gescatering'),\r
  ('purchase.read',      'purchase',   'read',     'Voir les commandes fournisseurs', null, 'gescatering'),\r
  ('purchase.prepare',   'purchase',   'write',    'Pr\xE9parer une commande fournisseur', null, 'gescatering'),\r
  ('purchase.approve',   'purchase',   'validate', 'Valider une commande fournisseur', null, 'gescatering'),\r
  ('purchase.order',     'purchase',   'write',    'Passer la commande au fournisseur',\r
     'Uniquement une commande valid\xE9e', 'gescatering'),\r
  ('reception.record',   'reception',  'write',    'Enregistrer une r\xE9ception', null, 'gescatering')\r
on conflict (key) do update\r
  set label       = excluded.label,\r
      description = excluded.description,\r
      domain      = excluded.domain,\r
      action      = excluded.action,\r
      product     = excluded.product;\r
\r
insert into platform.roles (organization_id, product, key, label, description, rank, is_system) values\r
  (null, 'gescatering', 'ops_director', 'Production',\r
     'Valide les demandes, les plannings et les commandes fournisseurs', 25, true),\r
  (null, 'gescatering', 'storekeeper',  'Stock',\r
     'Stock, r\xE9servations, sorties, r\xE9ceptions, transmission des besoins', 35, true),\r
  (null, 'gescatering', 'purchasing',   'Achats',\r
     'Pr\xE9pare et passe les commandes fournisseurs', 35, true),\r
  (null, 'gescatering', 'kitchen',      'Cuisine',\r
     'Planifie la production et consulte les fiches techniques', 40, true),\r
  (null, 'gescatering', 'requester',    'Service demandeur',\r
     'Cr\xE9e et suit les demandes de son service', 45, true)\r
on conflict on constraint uq_roles_scope do update\r
  set label       = excluded.label,\r
      description = excluded.description,\r
      rank        = excluded.rank;\r
\r
do $$\r
declare\r
  v_role uuid;\r
  r record;\r
begin\r
  -- owner et admin : tout le catalogue GesCatering\r
  for v_role in\r
    select id from platform.roles where is_system and product is null and key in ('owner','admin')\r
  loop\r
    insert into platform.role_permissions (role_id, permission_key)\r
    select v_role, key from platform.permissions where product = 'gescatering'\r
    on conflict do nothing;\r
  end loop;\r
\r
  for r in\r
    select * from (values\r
      -- Direction d'exploitation : valide, voit tout, ne passe pas la commande\r
      ('ops_director', array[\r
         'organization.read','settings.read','member.read','member.invite','audit.read',\r
         'report.read','report.export','document.read','document.create',\r
         'catalog.read','stock.read','stock.adjust',\r
         'request.create','request.read_all','request.approve',\r
         'recipe.manage','recipe.validate','production.plan','production.approve',\r
         'event.manage','purchase.read','purchase.approve']),\r
      ('storekeeper', array[\r
         'organization.read','settings.read','member.read','report.read',\r
         'document.read','document.create',\r
         'catalog.read','catalog.manage',\r
         'stock.read','stock.move','stock.reserve','stock.adjust','stock.transfer',\r
         'request.read_all','need.transmit','purchase.read','reception.record']),\r
      ('purchasing', array[\r
         'organization.read','settings.read','member.read','report.read',\r
         'document.read','document.create',\r
         'catalog.read','stock.read','purchase.read','purchase.prepare','purchase.order']),\r
      ('kitchen', array[\r
         'organization.read','settings.read','member.read',\r
         'catalog.read','stock.read','request.create',\r
         'recipe.manage','production.plan','event.manage']),\r
      ('requester', array[\r
         'organization.read','settings.read',\r
         'catalog.read','request.create'])\r
    ) as t(role_key, perms)\r
  loop\r
    select id into v_role from platform.roles\r
     where is_system and product = 'gescatering' and key = r.role_key;\r
    insert into platform.role_permissions (role_id, permission_key)\r
    select v_role, unnest(r.perms)\r
    on conflict do nothing;\r
  end loop;\r
end $$;\r
`},{name:"migrations/C0002__reference_data.sql",sql:`-- =====================================================================
--  C0002 \u2014 R\xE9f\xE9rentiel : param\xE8tres, sites, services, unit\xE9s, catalogue,
--          fournisseurs
--
--  R\xE8gles transverses appliqu\xE9es \xE0 toutes les tables de ce fichier :
--
--   \u2022 organization_id NOT NULL, immuable, renseign\xE9 automatiquement.
--   \u2022 CL\xC9S \xC9TRANG\xC8RES COMPOSITES (id, organization_id) : un produit ne peut
--     r\xE9f\xE9rencer qu'une cat\xE9gorie ou une unit\xE9 de SA propre organisation.
--     Sans cela, un appel API direct pourrait rattacher une ligne \xE0 l'objet
--     d'un autre client (le\xE7on de l'audit SIGB de GesSchool).
--   \u2022 Pas de suppression physique : \`deleted_at\` ou \`is_active\`.
--   \u2022 Lecture : tout membre de l'organisation. \xC9criture : \`catalog.manage\`.
--
--  \u26A0\uFE0F Stock central OU stock par site : les deux modes reposent sur le m\xEAme
--     mod\xE8le. Un \xAB site \xBB qui d\xE9tient du stock (\`holds_stock\`) est un
--     magasin. Mode central = un seul site d\xE9tenteur ; mode multi-sites =
--     plusieurs, avec transferts. Le mode est un param\xE8tre, pas un sch\xE9ma.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. PARAM\xC8TRES DU PRODUIT, PAR ORGANISATION
-- ---------------------------------------------------------------------
create table if not exists public.catering_settings (
  organization_id uuid primary key
                    references platform.organizations(id) on delete cascade,
  -- 'central' : un magasin unique ; 'multi_site' : stock par site + transferts
  stock_mode      text not null default 'central'
                    check (stock_mode in ('central', 'multi_site')),
  -- Une demande cr\xE9\xE9e n'est JAMAIS servie sans validation, sauf si
  -- l'organisation d\xE9sactive explicitement ce circuit.
  request_approval_required boolean not null default true,
  -- Commande fournisseur : validation exig\xE9e \xE0 partir de ce montant.
  -- 0 = TOUTES les commandes passent par la direction d'exploitation.
  -- Une commande dont un prix est inconnu exige toujours une validation.
  purchase_approval_threshold numeric(14,2) not null default 0
                    check (purchase_approval_threshold >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.catering_settings is
  'Param\xE8tres GesCatering par organisation : mode de stock, circuits de validation.';

-- ---------------------------------------------------------------------
--  2. SITES (magasins, cuisines, sites clients)
-- ---------------------------------------------------------------------
create table if not exists public.sites (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  name            text not null check (length(trim(name)) > 0),
  kind            text not null default 'central_store'
                    check (kind in ('central_store', 'client_site', 'kitchen', 'other')),
  holds_stock     boolean not null default true,
  address         text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_sites_id_org unique (id, organization_id)
);
create unique index if not exists uq_sites_name
  on public.sites (organization_id, lower(trim(name)));

-- ---------------------------------------------------------------------
--  3. SERVICES DEMANDEURS
-- ---------------------------------------------------------------------
create table if not exists public.departments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  site_id         uuid,
  name            text not null check (length(trim(name)) > 0),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_departments_id_org unique (id, organization_id),
  constraint fk_departments_site foreign key (site_id, organization_id)
    references public.sites (id, organization_id)
);
create unique index if not exists uq_departments_name
  on public.departments (organization_id, lower(trim(name)));

-- ---------------------------------------------------------------------
--  4. UNIT\xC9S DE MESURE
--
--  Conversion AUTOMATIQUE uniquement si une r\xE8gle fiable existe :
--   \u2022 m\xEAme dimension (masse, volume, comptage) \u2192 facteur vers l'unit\xE9 de
--     base (g, ml, pi\xE8ce). 1 kg = 1000 g, toujours vrai.
--   \u2022 conditionnement (bidon, sac, carton\u2026) \u2192 AUCUNE conversion g\xE9n\xE9rique :
--     un bidon de javel ne contient pas la m\xEAme chose qu'un bidon d'huile.
--     Il faut une conversion PAR PRODUIT, valid\xE9e (table 7).
--
--  organization_id null = unit\xE9 de r\xE9f\xE9rence partag\xE9e (non modifiable).
-- ---------------------------------------------------------------------
create table if not exists public.units (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references platform.organizations(id) on delete cascade,
  code            text not null check (code ~ '^[a-z][a-z0-9_]*$'),
  label           text not null,
  dimension       text not null check (dimension in ('mass', 'volume', 'count', 'package')),
  -- Quantit\xE9 d'unit\xE9 de base contenue dans 1 unit\xE9. Null pour 'package'.
  factor_to_base  numeric(18,6),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint ck_units_factor check (
    (dimension = 'package' and factor_to_base is null)
    or (dimension <> 'package' and factor_to_base > 0)),
  constraint uq_units_code unique nulls not distinct (organization_id, code)
);

insert into public.units (organization_id, code, label, dimension, factor_to_base) values
  (null, 'g',      'gramme',      'mass',    1),
  (null, 'kg',     'kilogramme',  'mass',    1000),
  (null, 'ml',     'millilitre',  'volume',  1),
  (null, 'cl',     'centilitre',  'volume',  10),
  (null, 'l',      'litre',       'volume',  1000),
  (null, 'piece',  'pi\xE8ce',       'count',   1),
  (null, 'dozen',  'douzaine',    'count',   12),
  (null, 'portion','portion',     'count',   1),
  (null, 'bidon',  'bidon',       'package', null),
  (null, 'sac',    'sac',         'package', null),
  (null, 'carton', 'carton',      'package', null),
  (null, 'boite',  'bo\xEEte',       'package', null),
  (null, 'sachet', 'sachet',      'package', null),
  (null, 'botte',  'botte',       'package', null),
  (null, 'paquet', 'paquet',      'package', null),
  (null, 'rouleau','rouleau',     'package', null)
on conflict on constraint uq_units_code do update
  set label = excluded.label;

-- ---------------------------------------------------------------------
--  5. CAT\xC9GORIES
-- ---------------------------------------------------------------------
create table if not exists public.product_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  name            text not null check (length(trim(name)) > 0),
  kind            text not null default 'other'
                    check (kind in ('food', 'cleaning', 'maintenance', 'consumable',
                                    'service_setup', 'equipment', 'other')),
  icon            text,               -- nom d'ic\xF4ne ou emoji, aide \xE0 la reconnaissance
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_categories_id_org unique (id, organization_id)
);
create unique index if not exists uq_categories_name
  on public.product_categories (organization_id, lower(trim(name)));

-- ---------------------------------------------------------------------
--  6. PRODUITS
--
--  Doublons : la r\xE9f\xE9rence est unique, ET le nom normalis\xE9 aussi (casse et
--  espaces ignor\xE9s). \xAB Riz bris\xE9 \xBB et \xAB riz  BRIS\xC9 \xBB ne peuvent coexister.
--  On ne fusionne JAMAIS automatiquement des noms seulement ressemblants.
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references platform.organizations(id) on delete cascade,
  reference        text not null check (length(trim(reference)) > 0),
  name             text not null check (length(trim(name)) > 0),
  category_id      uuid not null,
  stock_unit_id    uuid not null references public.units(id),
  purchase_unit_id uuid references public.units(id),
  photo_url        text,
  min_stock        numeric(14,3) not null default 0 check (min_stock >= 0),
  reception_notes  text,               -- ex. \xAB v\xE9rifier DLC \xBB, \xAB cha\xEEne du froid \xBB
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint uq_products_id_org unique (id, organization_id),
  constraint uq_products_reference unique (organization_id, reference),
  constraint fk_products_category foreign key (category_id, organization_id)
    references public.product_categories (id, organization_id)
);
create unique index if not exists uq_products_name
  on public.products (organization_id, lower(regexp_replace(trim(name), '\\s+', ' ', 'g')));
create index if not exists idx_products_category on public.products (category_id);

-- ---------------------------------------------------------------------
--  7. CONVERSIONS PAR PRODUIT (conditionnements)
--  \xAB 1 bidon de javel = 5 l \xBB. Seules les conversions VALID\xC9ES servent au
--  calcul automatique ; une conversion propos\xE9e attend une validation.
-- ---------------------------------------------------------------------
create table if not exists public.product_unit_conversions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  product_id      uuid not null,
  unit_id         uuid not null references public.units(id),
  -- Quantit\xE9, en UNIT\xC9 DE STOCK du produit, contenue dans 1 unit_id.
  factor          numeric(18,6) not null check (factor > 0),
  is_validated    boolean not null default false,
  validated_by    uuid references auth.users(id) on delete set null,
  validated_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_product_unit unique (product_id, unit_id),
  constraint fk_conv_product foreign key (product_id, organization_id)
    references public.products (id, organization_id)
);

-- ---------------------------------------------------------------------
--  8. FOURNISSEURS ET OFFRES
-- ---------------------------------------------------------------------
create table if not exists public.suppliers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  name            text not null check (length(trim(name)) > 0),
  contact_name    text,
  phone           text,
  email           text,
  address         text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_suppliers_id_org unique (id, organization_id)
);
create unique index if not exists uq_suppliers_name
  on public.suppliers (organization_id, lower(trim(name)));

create table if not exists public.supplier_products (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  supplier_id     uuid not null,
  product_id      uuid not null,
  unit_id         uuid not null references public.units(id),   -- unit\xE9 d'achat
  unit_price      numeric(14,2) check (unit_price >= 0),       -- null = prix inconnu
  lead_time_days  integer check (lead_time_days >= 0),
  is_preferred    boolean not null default false,
  price_updated_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_supplier_product unique (supplier_id, product_id, unit_id),
  constraint fk_sp_supplier foreign key (supplier_id, organization_id)
    references public.suppliers (id, organization_id),
  constraint fk_sp_product foreign key (product_id, organization_id)
    references public.products (id, organization_id)
);

-- ---------------------------------------------------------------------
--  9. UNE UNIT\xC9 D'ORGANISATION NE SE R\xC9F\xC9RENCE QUE DANS SON ORGANISATION
--  (units.organization_id est nullable : la FK composite ne s'applique pas)
-- ---------------------------------------------------------------------
create or replace function public.check_unit_visible()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit_org uuid;
  v_col      text;
  v_unit     uuid;
begin
  foreach v_col in array tg_argv loop
    v_unit := (to_jsonb(new) ->> v_col)::uuid;
    continue when v_unit is null;
    select organization_id into v_unit_org from public.units where id = v_unit;
    if v_unit_org is not null and v_unit_org <> new.organization_id then
      raise exception 'Unit\xE9 inconnue pour cette organisation.' using errcode = '23503';
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists trg_products_unit_visible on public.products;
create trigger trg_products_unit_visible before insert or update on public.products
  for each row execute function public.check_unit_visible('stock_unit_id', 'purchase_unit_id');
drop trigger if exists trg_conv_unit_visible on public.product_unit_conversions;
create trigger trg_conv_unit_visible before insert or update on public.product_unit_conversions
  for each row execute function public.check_unit_visible('unit_id');
drop trigger if exists trg_sp_unit_visible on public.supplier_products;
create trigger trg_sp_unit_visible before insert or update on public.supplier_products
  for each row execute function public.check_unit_visible('unit_id');

-- Une conversion valid\xE9e garde la trace de QUI l'a valid\xE9e. Le client ne
-- peut pas l'attribuer \xE0 un autre.
create or replace function public.stamp_conversion_validation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_validated and (tg_op = 'INSERT' or not old.is_validated
                           or new.factor <> old.factor) then
    new.validated_by := auth.uid();
    new.validated_at := now();
  elsif not new.is_validated then
    new.validated_by := null;
    new.validated_at := null;
  end if;
  return new;
end $$;

drop trigger if exists trg_conv_validation on public.product_unit_conversions;
create trigger trg_conv_validation before insert or update on public.product_unit_conversions
  for each row execute function public.stamp_conversion_validation();

-- ---------------------------------------------------------------------
--  10. CONVERSION VERS L'UNIT\xC9 DE STOCK \u2014 logique centralis\xE9e
--  Utilis\xE9e par TOUTES les op\xE9rations de stock, d'achat et de calcul des
--  besoins. Refuse plut\xF4t que de deviner.
-- ---------------------------------------------------------------------
create or replace function public.convert_to_stock_unit(
  p_product_id uuid,
  p_unit_id    uuid,
  p_quantity   numeric
)
returns numeric
language plpgsql
stable
set search_path = ''
as $$
declare
  v_stock_unit uuid;
  v_product    text;
  f            public.units;
  t            public.units;
  v_factor     numeric;
begin
  select stock_unit_id, name into v_stock_unit, v_product
    from public.products where id = p_product_id;
  if v_stock_unit is null then
    raise exception 'Produit introuvable.' using errcode = 'P0002';
  end if;

  if p_unit_id is null or p_unit_id = v_stock_unit then
    return p_quantity;
  end if;

  select * into f from public.units where id = p_unit_id;
  select * into t from public.units where id = v_stock_unit;

  if f.dimension = t.dimension and f.dimension <> 'package' then
    return p_quantity * f.factor_to_base / t.factor_to_base;
  end if;

  select factor into v_factor
    from public.product_unit_conversions
   where product_id = p_product_id and unit_id = p_unit_id and is_validated;
  if v_factor is not null then
    return p_quantity * v_factor;
  end if;

  raise exception 'Conversion inconnue : % en % pour \xAB % \xBB.', f.label, t.label, v_product
    using errcode = '22023',
          hint = 'Ajouter et faire valider une conversion pour ce produit.';
end $$;

comment on function public.convert_to_stock_unit(uuid, uuid, numeric) is
  'Convertit une quantit\xE9 vers l''unit\xE9 de stock du produit. M\xEAme dimension : '
  'facteur exact. Conditionnement : conversion produit VALID\xC9E uniquement. Sinon refus.';

-- ---------------------------------------------------------------------
--  11. TRIGGERS DU SOCLE
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['catering_settings','sites','departments','product_categories',
                           'products','product_unit_conversions','suppliers','supplier_products']
  loop
    perform platform.attach_updated_at('public', t);
    perform platform.attach_org_immutability('public', t);
    perform platform.attach_org_default('public', t);
  end loop;
  perform platform.attach_updated_at('public', 'units');
  perform platform.attach_org_immutability('public', 'units');
end $$;

-- Audit des D\xC9CISIONS (r\xE9f\xE9rentiel, prix, param\xE8tres), pas des flux.
select platform.attach_audit('public', 'catering_settings');
select platform.attach_audit('public', 'products');
select platform.attach_audit('public', 'product_unit_conversions');
select platform.attach_audit('public', 'suppliers');
select platform.attach_audit('public', 'supplier_products');
select platform.attach_audit('public', 'sites');

-- ---------------------------------------------------------------------
--  12. RLS
-- ---------------------------------------------------------------------
alter table public.catering_settings        enable row level security;
alter table public.sites                    enable row level security;
alter table public.departments              enable row level security;
alter table public.units                    enable row level security;
alter table public.product_categories       enable row level security;
alter table public.products                 enable row level security;
alter table public.product_unit_conversions enable row level security;
alter table public.suppliers                enable row level security;
alter table public.supplier_products        enable row level security;

-- Lecture membre / \xE9criture catalog.manage, sans suppression physique.
do $$
declare t text;
begin
  foreach t in array array['sites','departments','product_categories','products',
                           'product_unit_conversions','suppliers','supplier_products']
  loop
    execute format('drop policy if exists %1$s_select on public.%1$I', t);
    execute format(
      'create policy %1$s_select on public.%1$I for select to authenticated '
      || 'using (organization_id = any (platform.current_org_ids()))', t);

    execute format('drop policy if exists %1$s_insert on public.%1$I', t);
    execute format(
      'create policy %1$s_insert on public.%1$I for insert to authenticated '
      || 'with check (platform.has_permission(organization_id, ''catalog.manage''))', t);

    execute format('drop policy if exists %1$s_update on public.%1$I', t);
    execute format(
      'create policy %1$s_update on public.%1$I for update to authenticated '
      || 'using (platform.has_permission(organization_id, ''catalog.manage'')) '
      || 'with check (platform.has_permission(organization_id, ''catalog.manage''))', t);

    execute format('revoke delete, truncate on public.%I from anon, authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- Prix fournisseurs : r\xE9serv\xE9s aux r\xF4les d'achat et de stock, pas aux
-- services demandeurs ni \xE0 la cuisine.
drop policy if exists supplier_products_select on public.supplier_products;
create policy supplier_products_select on public.supplier_products
  for select to authenticated
  using (platform.has_permission(organization_id, 'purchase.read')
         or platform.has_permission(organization_id, 'catalog.manage'));

-- Unit\xE9s : r\xE9f\xE9rence partag\xE9e en lecture ; unit\xE9s maison via catalog.manage.
drop policy if exists units_select on public.units;
create policy units_select on public.units
  for select to authenticated
  using (organization_id is null or organization_id = any (platform.current_org_ids()));
drop policy if exists units_insert on public.units;
create policy units_insert on public.units
  for insert to authenticated
  with check (organization_id is not null
              and platform.has_permission(organization_id, 'catalog.manage'));
drop policy if exists units_update on public.units;
create policy units_update on public.units
  for update to authenticated
  using      (organization_id is not null
              and platform.has_permission(organization_id, 'catalog.manage'))
  with check (organization_id is not null
              and platform.has_permission(organization_id, 'catalog.manage'));
revoke delete, truncate on public.units from anon, authenticated;
revoke all on public.units from anon;

-- Param\xE8tres : lecture membre, modification settings.manage.
drop policy if exists catering_settings_select on public.catering_settings;
create policy catering_settings_select on public.catering_settings
  for select to authenticated
  using (organization_id = any (platform.current_org_ids()));
drop policy if exists catering_settings_update on public.catering_settings;
create policy catering_settings_update on public.catering_settings
  for update to authenticated
  using      (platform.has_permission(organization_id, 'settings.manage'))
  with check (platform.has_permission(organization_id, 'settings.manage'));
revoke insert, delete, truncate on public.catering_settings from anon, authenticated;
revoke all on public.catering_settings from anon;

revoke all on function public.check_unit_visible() from public, anon, authenticated;
revoke all on function public.stamp_conversion_validation() from public, anon, authenticated;
revoke all on function public.convert_to_stock_unit(uuid, uuid, numeric) from public, anon;
grant execute on function public.convert_to_stock_unit(uuid, uuid, numeric) to authenticated;

-- ---------------------------------------------------------------------
--  13. INITIALISATION D'UNE ORGANISATION
--  Param\xE8tres + magasin central + cat\xE9gories par d\xE9faut. Idempotent.
-- ---------------------------------------------------------------------
create or replace function public.init_catering_organization(p_organization_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  -- Appel client : r\xE9serv\xE9 \xE0 l'administration de l'organisation. Appel
  -- sans identit\xE9 (provisionnement, migration) : autoris\xE9.
  if auth.uid() is not null
     and not platform.has_permission(p_organization_id, 'organization.manage') then
    raise exception 'Op\xE9ration r\xE9serv\xE9e \xE0 l''administrateur.' using errcode = '42501';
  end if;

  insert into public.catering_settings (organization_id)
  values (p_organization_id)
  on conflict (organization_id) do nothing;

  if not exists (select 1 from public.sites where organization_id = p_organization_id) then
    insert into public.sites (organization_id, name, kind, holds_stock)
    values (p_organization_id, 'Magasin central', 'central_store', true);
  end if;

  insert into public.product_categories (organization_id, name, kind, icon, sort_order)
  select p_organization_id, c.name, c.kind, c.icon, c.sort_order
    from (values
      ('Ingr\xE9dients alimentaires', 'food',          '\u{1F955}', 10),
      ('Fast food',                'food',          '\u{1F354}', 15),
      ('P\xE2tisserie',               'food',          '\u{1F9C1}', 18),
      ('Produits d''entretien',    'maintenance',   '\u{1F9F4}', 20),
      ('Produits de nettoyage',    'cleaning',      '\u{1F9FD}', 30),
      ('Consommables',             'consumable',    '\u{1F964}', 40),
      ('Mise en service',          'service_setup', '\u{1F37D}\uFE0F', 50),
      ('Mat\xE9riel et fournitures',  'equipment',     '\u{1F4E6}', 60)
    ) as c(name, kind, icon, sort_order)
   where not exists (
     select 1 from public.product_categories pc
      where pc.organization_id = p_organization_id
        and lower(trim(pc.name)) = lower(trim(c.name)));
end $$;

revoke all on function public.init_catering_organization(uuid) from public, anon;
grant execute on function public.init_catering_organization(uuid) to authenticated;
`},{name:"migrations/C0003__stock_core.sql",sql:`-- =====================================================================\r
--  C0003 \u2014 C\u0153ur du stock : niveaux, mouvements, r\xE9servations\r
--\r
--  R\xC8GLES DE CALCUL (docs/REGLES-METIER.md) :\r
--\r
--    stock physique  (on_hand)  = somme des mouvements du couple site\xD7produit\r
--    r\xE9serv\xE9         (reserved) = somme des r\xE9servations actives\r
--    disponible                 = physique \u2212 r\xE9serv\xE9\r
--    attendu         (C0004)    = command\xE9 et non re\xE7u \u2014 JAMAIS ajout\xE9 au physique\r
--\r
--  INVARIANTS GARANTIS PAR LA BASE (contraintes, pas seulement le code) :\r
--    \u2022 physique \u2265 0                       \u2192 pas de stock n\xE9gatif\r
--    \u2022 0 \u2264 r\xE9serv\xE9 \u2264 physique             \u2192 on ne r\xE9serve que ce qui est l\xE0\r
--    \u2022 l'historique des mouvements est append-only : ni UPDATE ni DELETE,\r
--      m\xEAme par le propri\xE9taire de la table. On corrige par contre-passation.\r
--    \u2022 une cl\xE9 d'idempotence par op\xE9ration \u2192 un double clic, une requ\xEAte\r
--      rejou\xE9e par le r\xE9seau, ne cr\xE9e jamais deux mouvements.\r
--    \u2022 une seule r\xE9servation active par (besoin, site, produit) \u2192 un m\xEAme\r
--      besoin ne r\xE9serve pas deux fois.\r
--\r
--  \xC9CRITURE : AUCUNE policy d'\xE9criture sur ces tables. Toute modification\r
--  passe par les RPC ci-dessous, qui v\xE9rifient permission ET p\xE9rim\xE8tre, et\r
--  verrouillent la ligne de stock (\`for update\`) pendant la transaction :\r
--  deux op\xE9rations simultan\xE9es sur le m\xEAme produit s'ex\xE9cutent l'une apr\xE8s\r
--  l'autre, jamais entrelac\xE9es.\r
-- =====================================================================\r
\r
-- Fonctions internes : hors de \`public\`, donc jamais expos\xE9es par l'API.\r
create schema if not exists gescatering_internal;\r
revoke all on schema gescatering_internal from public, anon, authenticated;\r
-- PostgreSQL rend toute nouvelle fonction ex\xE9cutable par PUBLIC. Ici, une\r
-- fonction interne oubli\xE9e (apply_movement !) permettrait d'\xE9crire le stock\r
-- sans contr\xF4le : on retire ce droit par d\xE9faut pour tout le sch\xE9ma.\r
alter default privileges in schema gescatering_internal\r
  revoke execute on functions from public;\r
\r
-- ---------------------------------------------------------------------\r
--  1. NIVEAUX DE STOCK (une ligne par site \xD7 produit)\r
-- ---------------------------------------------------------------------\r
create table if not exists public.stock_levels (\r
  organization_id uuid not null references platform.organizations(id) on delete cascade,\r
  site_id         uuid not null,\r
  product_id      uuid not null,\r
  on_hand         numeric(14,3) not null default 0,\r
  reserved        numeric(14,3) not null default 0,\r
  updated_at      timestamptz not null default now(),\r
  primary key (site_id, product_id),\r
  constraint ck_stock_on_hand_positive check (on_hand >= 0),\r
  constraint ck_stock_reserved_range   check (reserved >= 0 and reserved <= on_hand),\r
  constraint fk_levels_site foreign key (site_id, organization_id)\r
    references public.sites (id, organization_id),\r
  constraint fk_levels_product foreign key (product_id, organization_id)\r
    references public.products (id, organization_id)\r
);\r
\r
comment on table public.stock_levels is\r
  'Stock physique et r\xE9serv\xE9 par site \xD7 produit. \xC9crit UNIQUEMENT par les RPC de stock.';\r
\r
-- ---------------------------------------------------------------------\r
--  2. MOUVEMENTS (journal append-only)\r
-- ---------------------------------------------------------------------\r
create table if not exists public.stock_movements (\r
  id                   uuid primary key default gen_random_uuid(),\r
  organization_id      uuid not null references platform.organizations(id) on delete cascade,\r
  site_id              uuid not null,\r
  product_id           uuid not null,\r
  kind                 text not null check (kind in (\r
                         'receipt',         -- r\xE9ception (commande ou entr\xE9e directe)\r
                         'issue',           -- sortie (service, production, prestation)\r
                         'return',          -- retour en stock\r
                         'adjustment_in',   -- correction / inventaire +\r
                         'adjustment_out',  -- correction / inventaire \u2212, perte\r
                         'transfer_in',     -- arriv\xE9e depuis un autre site\r
                         'transfer_out',    -- d\xE9part vers un autre site\r
                         'reversal')),      -- contre-passation d'un mouvement erron\xE9\r
  -- Variation sign\xE9e du stock physique, en unit\xE9 de stock.\r
  quantity_delta       numeric(14,3) not null check (quantity_delta <> 0),\r
  -- Ce que l'utilisateur a saisi, avant conversion (tra\xE7abilit\xE9).\r
  entered_quantity     numeric(14,3),\r
  entered_unit_id      uuid references public.units(id),\r
  on_hand_after        numeric(14,3) not null,\r
  reason               text,\r
  -- Pi\xE8ce d'origine : demande, production, prestation, r\xE9ception, transfert\u2026\r
  source_type          text,\r
  source_id            uuid,\r
  reservation_id       uuid,\r
  reverses_movement_id uuid references public.stock_movements(id),\r
  idempotency_key      text,\r
  created_by           uuid references auth.users(id) on delete set null,\r
  created_at           timestamptz not null default now(),\r
  constraint ck_movement_sign check (\r
       (kind in ('receipt','return','adjustment_in','transfer_in') and quantity_delta > 0)\r
    or (kind in ('issue','adjustment_out','transfer_out')         and quantity_delta < 0)\r
    or (kind = 'reversal' and reverses_movement_id is not null)),\r
  constraint uq_movement_idempotency unique (organization_id, idempotency_key),\r
  -- Un mouvement ne se contre-passe qu'une fois.\r
  constraint uq_movement_reversal unique (reverses_movement_id),\r
  constraint fk_mov_site foreign key (site_id, organization_id)\r
    references public.sites (id, organization_id),\r
  constraint fk_mov_product foreign key (product_id, organization_id)\r
    references public.products (id, organization_id)\r
);\r
create index if not exists idx_movements_site_product\r
  on public.stock_movements (site_id, product_id, created_at desc);\r
create index if not exists idx_movements_source\r
  on public.stock_movements (source_type, source_id);\r
\r
create or replace function gescatering_internal.forbid_movement_mutation()\r
returns trigger\r
language plpgsql\r
as $$\r
begin\r
  raise exception 'L''historique des mouvements ne se modifie pas (tentative de %).', tg_op\r
    using errcode = '42501',\r
          hint = 'Corriger par une contre-passation : reverse_stock_movement().';\r
end $$;\r
\r
drop trigger if exists trg_stock_movements_immutable on public.stock_movements;\r
create trigger trg_stock_movements_immutable\r
  before update or delete or truncate on public.stock_movements\r
  for each statement execute function gescatering_internal.forbid_movement_mutation();\r
\r
-- ---------------------------------------------------------------------\r
--  3. R\xC9SERVATIONS\r
--\r
--  requested : ce dont le besoin a besoin\r
--  reserved  : ce qui est actuellement mis de c\xF4t\xE9 (diminue \xE0 la sortie)\r
--  issued    : ce qui est d\xE9j\xE0 sorti du stock pour ce besoin\r
--  manque    = requested \u2212 reserved \u2212 issued  (calcul\xE9, jamais stock\xE9)\r
-- ---------------------------------------------------------------------\r
create table if not exists public.stock_reservations (\r
  id                 uuid primary key default gen_random_uuid(),\r
  organization_id    uuid not null references platform.organizations(id) on delete cascade,\r
  site_id            uuid not null,\r
  product_id         uuid not null,\r
  source_type        text not null check (source_type ~ '^[a-z][a-z_]*$'),\r
  source_id          uuid not null,\r
  requested_quantity numeric(14,3) not null check (requested_quantity > 0),\r
  reserved_quantity  numeric(14,3) not null default 0 check (reserved_quantity >= 0),\r
  issued_quantity    numeric(14,3) not null default 0 check (issued_quantity >= 0),\r
  needed_by          date,\r
  status             text not null default 'active'\r
                       check (status in ('active', 'consumed', 'released')),\r
  close_reason       text,\r
  created_by         uuid references auth.users(id) on delete set null,\r
  created_at         timestamptz not null default now(),\r
  updated_at         timestamptz not null default now(),\r
  closed_at          timestamptz,\r
  constraint ck_reservation_closed check (status = 'active' or reserved_quantity = 0),\r
  constraint fk_res_site foreign key (site_id, organization_id)\r
    references public.sites (id, organization_id),\r
  constraint fk_res_product foreign key (product_id, organization_id)\r
    references public.products (id, organization_id)\r
);\r
-- Un m\xEAme besoin ne r\xE9serve qu'une fois le m\xEAme produit sur le m\xEAme site.\r
create unique index if not exists uq_reservation_active_source\r
  on public.stock_reservations (source_type, source_id, site_id, product_id)\r
  where status = 'active';\r
create index if not exists idx_reservations_level\r
  on public.stock_reservations (site_id, product_id) where status = 'active';\r
\r
alter table public.stock_movements\r
  drop constraint if exists fk_mov_reservation;\r
alter table public.stock_movements\r
  add constraint fk_mov_reservation foreign key (reservation_id)\r
  references public.stock_reservations (id);\r
\r
select platform.attach_updated_at('public', 'stock_reservations');\r
select platform.attach_org_immutability('public', 'stock_reservations');\r
select platform.attach_org_immutability('public', 'stock_levels');\r
-- Les r\xE9servations engagent le stock d'un besoin pr\xE9cis : d\xE9cision trac\xE9e.\r
select platform.attach_audit('public', 'stock_reservations');\r
\r
-- ---------------------------------------------------------------------\r
--  4. RLS \u2014 lecture seule, cloisonn\xE9e par site\r
-- ---------------------------------------------------------------------\r
alter table public.stock_levels       enable row level security;\r
alter table public.stock_movements    enable row level security;\r
alter table public.stock_reservations enable row level security;\r
\r
do $$\r
declare t text;\r
begin\r
  foreach t in array array['stock_levels','stock_movements','stock_reservations'] loop\r
    execute format('drop policy if exists %1$s_select on public.%1$I', t);\r
    execute format(\r
      'create policy %1$s_select on public.%1$I for select to authenticated using ('\r
      || '    platform.has_permission(organization_id, ''stock.read'')'\r
      || ' and platform.in_scope(organization_id, ''site'', site_id))', t);\r
    -- Aucune policy d'\xE9criture, et aucun droit : ceinture ET bretelles.\r
    execute format('revoke all on public.%I from anon, authenticated', t);\r
    execute format('grant select on public.%I to authenticated', t);\r
  end loop;\r
end $$;\r
\r
-- =====================================================================\r
--  5. FONCTIONS INTERNES\r
-- =====================================================================\r
\r
-- Refus homog\xE8ne, compr\xE9hensible par l'utilisateur final.\r
create or replace function gescatering_internal.deny(p_message text)\r
returns void\r
language plpgsql\r
as $$\r
begin\r
  raise exception '%', p_message using errcode = '42501';\r
end $$;\r
\r
-- Contr\xF4le d'acc\xE8s commun : permission + p\xE9rim\xE8tre site. Renvoie l'organisation.\r
create or replace function gescatering_internal.authorize_site(\r
  p_site_id    uuid,\r
  p_permission text\r
)\r
returns uuid\r
language plpgsql\r
stable\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_org         uuid;\r
  v_holds_stock boolean;\r
  v_active      boolean;\r
begin\r
  select organization_id, holds_stock, is_active\r
    into v_org, v_holds_stock, v_active\r
    from public.sites where id = p_site_id;\r
\r
  -- Site inexistant OU d'une autre organisation : m\xEAme message, pour ne\r
  -- rien r\xE9v\xE9ler de l'existence des donn\xE9es d'autrui.\r
  if v_org is null or not (v_org = any (platform.current_org_ids())) then\r
    perform gescatering_internal.deny('Site introuvable.');\r
  end if;\r
  if not platform.has_permission(v_org, p_permission) then\r
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : vous n''avez pas le droit de faire cela.');\r
  end if;\r
  if not platform.in_scope(v_org, 'site', p_site_id) then\r
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : ce site ne fait pas partie de votre p\xE9rim\xE8tre.');\r
  end if;\r
  if not v_active or not v_holds_stock then\r
    raise exception 'Ce site ne g\xE8re pas de stock.' using errcode = '22023';\r
  end if;\r
  return v_org;\r
end $$;\r
\r
-- Verrouille (et cr\xE9e au besoin) la ligne de stock site \xD7 produit.\r
create or replace function gescatering_internal.lock_level(\r
  p_org        uuid,\r
  p_site_id    uuid,\r
  p_product_id uuid\r
)\r
returns public.stock_levels\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_level public.stock_levels;\r
begin\r
  insert into public.stock_levels (organization_id, site_id, product_id)\r
  values (p_org, p_site_id, p_product_id)\r
  on conflict (site_id, product_id) do nothing;\r
\r
  select * into v_level from public.stock_levels\r
   where site_id = p_site_id and product_id = p_product_id\r
   for update;\r
  return v_level;\r
end $$;\r
\r
-- Le SEUL point d'\xE9criture du stock physique. Toutes les RPC y passent.\r
create or replace function gescatering_internal.apply_movement(\r
  p_org              uuid,\r
  p_site_id          uuid,\r
  p_product_id       uuid,\r
  p_kind             text,\r
  p_delta            numeric,\r
  p_reserved_delta   numeric default 0,\r
  p_entered_quantity numeric default null,\r
  p_entered_unit_id  uuid    default null,\r
  p_reason           text    default null,\r
  p_source_type      text    default null,\r
  p_source_id        uuid    default null,\r
  p_reservation_id   uuid    default null,\r
  p_reverses_id      uuid    default null,\r
  p_idempotency_key  text    default null\r
)\r
returns uuid\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_level public.stock_levels;\r
  v_id    uuid;\r
  v_name  text;\r
  v_unit  text;\r
begin\r
  v_level := gescatering_internal.lock_level(p_org, p_site_id, p_product_id);\r
\r
  if v_level.on_hand + p_delta < 0\r
     or v_level.on_hand + p_delta < v_level.reserved + p_reserved_delta then\r
    select p.name, u.code into v_name, v_unit\r
      from public.products p join public.units u on u.id = p.stock_unit_id\r
     where p.id = p_product_id;\r
    raise exception 'Stock insuffisant pour \xAB % \xBB : disponible % %, demand\xE9 % %.',\r
      v_name,\r
      trim(to_char(v_level.on_hand - v_level.reserved, 'FM999999990.###')), v_unit,\r
      trim(to_char(abs(p_delta), 'FM999999990.###')), v_unit\r
      using errcode = '23514',\r
            hint = 'Le stock r\xE9serv\xE9 pour d''autres besoins n''est pas disponible.';\r
  end if;\r
\r
  update public.stock_levels\r
     set on_hand    = on_hand + p_delta,\r
         reserved   = reserved + p_reserved_delta,\r
         updated_at = now()\r
   where site_id = p_site_id and product_id = p_product_id;\r
\r
  insert into public.stock_movements (\r
    organization_id, site_id, product_id, kind, quantity_delta,\r
    entered_quantity, entered_unit_id, on_hand_after, reason,\r
    source_type, source_id, reservation_id, reverses_movement_id,\r
    idempotency_key, created_by)\r
  values (\r
    p_org, p_site_id, p_product_id, p_kind, p_delta,\r
    p_entered_quantity, p_entered_unit_id, v_level.on_hand + p_delta, p_reason,\r
    p_source_type, p_source_id, p_reservation_id, p_reverses_id,\r
    p_idempotency_key, auth.uid())\r
  returning id into v_id;\r
\r
  return v_id;\r
end $$;\r
\r
-- V\xE9rifie qu'un produit appartient \xE0 l'organisation et est actif.\r
create or replace function gescatering_internal.assert_product(p_org uuid, p_product_id uuid)\r
returns void\r
language plpgsql\r
stable\r
security definer\r
set search_path = ''\r
as $$\r
begin\r
  if not exists (select 1 from public.products\r
                  where id = p_product_id and organization_id = p_org) then\r
    raise exception 'Produit introuvable.' using errcode = 'P0002';\r
  end if;\r
end $$;\r
\r
-- =====================================================================\r
--  6. RPC PUBLIQUES\r
-- =====================================================================\r
\r
-- ---------------------------------------------------------------------\r
--  Entr\xE9e directe, sortie libre, retour, ajustement.\r
--  (Les r\xE9ceptions de commande passent par receive_purchase_order, C0004 ;\r
--   les sorties d'un besoin r\xE9serv\xE9 par issue_reserved_stock.)\r
-- ---------------------------------------------------------------------\r
create or replace function public.record_stock_movement(\r
  p_site_id         uuid,\r
  p_product_id      uuid,\r
  p_kind            text,\r
  p_quantity        numeric,\r
  p_unit_id         uuid default null,\r
  p_reason          text default null,\r
  p_idempotency_key text default null,\r
  p_source_type     text default null,\r
  p_source_id       uuid default null\r
)\r
returns uuid\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_org      uuid;\r
  v_qty      numeric;\r
  v_existing uuid;\r
  v_perm     text;\r
begin\r
  if p_kind not in ('receipt', 'issue', 'return', 'adjustment_in', 'adjustment_out') then\r
    raise exception 'Type de mouvement non autoris\xE9 ici : %.', p_kind using errcode = '22023';\r
  end if;\r
\r
  v_perm := case when p_kind in ('adjustment_in', 'adjustment_out')\r
                 then 'stock.adjust' else 'stock.move' end;\r
  v_org := gescatering_internal.authorize_site(p_site_id, v_perm);\r
  perform gescatering_internal.assert_product(v_org, p_product_id);\r
\r
  if p_kind in ('adjustment_in', 'adjustment_out', 'return')\r
     and coalesce(trim(p_reason), '') = '' then\r
    raise exception 'Le motif est obligatoire pour un retour ou un ajustement.'\r
      using errcode = '22023';\r
  end if;\r
\r
  if coalesce(p_quantity, 0) <= 0 then\r
    raise exception 'La quantit\xE9 doit \xEAtre sup\xE9rieure \xE0 z\xE9ro.' using errcode = '22023';\r
  end if;\r
\r
  -- Op\xE9ration d\xE9j\xE0 enregistr\xE9e (double clic, requ\xEAte rejou\xE9e) : on renvoie\r
  -- l'existante, sans rien r\xE9\xE9crire.\r
  if p_idempotency_key is not null then\r
    select id into v_existing from public.stock_movements\r
     where organization_id = v_org and idempotency_key = p_idempotency_key;\r
    if v_existing is not null then\r
      return v_existing;\r
    end if;\r
  end if;\r
\r
  v_qty := public.convert_to_stock_unit(p_product_id, p_unit_id, p_quantity);\r
\r
  return gescatering_internal.apply_movement(\r
    v_org, p_site_id, p_product_id, p_kind,\r
    case when p_kind in ('issue', 'adjustment_out') then -v_qty else v_qty end,\r
    0, p_quantity, p_unit_id, p_reason, p_source_type, p_source_id,\r
    null, null, p_idempotency_key);\r
exception\r
  -- Deux requ\xEAtes simultan\xE9es avec la m\xEAme cl\xE9 : la seconde renvoie la premi\xE8re.\r
  when unique_violation then\r
    if p_idempotency_key is not null then\r
      select id into v_existing from public.stock_movements\r
       where organization_id = v_org and idempotency_key = p_idempotency_key;\r
      if v_existing is not null then return v_existing; end if;\r
    end if;\r
    raise;\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  R\xE9servation d'un besoin valid\xE9.\r
--\r
--  R\xE9serve ce qui est disponible, sans d\xE9passer la demande. Rappel\xE9e pour\r
--  le m\xEAme besoin, elle COMPL\xC8TE la r\xE9servation existante (ex. apr\xE8s une\r
--  livraison) au lieu d'en cr\xE9er une seconde.\r
--  Renvoie la r\xE9servation, le total r\xE9serv\xE9 et le MANQUE.\r
--\r
--  C\u0153ur interne SANS contr\xF4le d'acc\xE8s : il sert aussi aux circuits d\xE9j\xE0\r
--  autoris\xE9s en amont (une demande valid\xE9e par la direction d'exploitation\r
--  r\xE9serve son stock sans que la direction d\xE9tienne \`stock.reserve\`).\r
-- ---------------------------------------------------------------------\r
create or replace function gescatering_internal.reserve_core(\r
  p_org         uuid,\r
  p_site_id     uuid,\r
  p_product_id  uuid,\r
  p_requested   numeric,      -- en unit\xE9 de stock\r
  p_source_type text,\r
  p_source_id   uuid,\r
  p_needed_by   date default null\r
)\r
returns public.stock_reservations\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_level public.stock_levels;\r
  v_res   public.stock_reservations;\r
  v_add   numeric;\r
begin\r
  if coalesce(p_requested, 0) <= 0 then\r
    raise exception 'La quantit\xE9 doit \xEAtre sup\xE9rieure \xE0 z\xE9ro.' using errcode = '22023';\r
  end if;\r
  if p_source_type is null or p_source_id is null then\r
    raise exception 'Une r\xE9servation est toujours rattach\xE9e \xE0 un besoin.' using errcode = '22023';\r
  end if;\r
\r
  -- Verrou d'abord : deux r\xE9servations simultan\xE9es du m\xEAme produit\r
  -- s'ex\xE9cutent l'une apr\xE8s l'autre.\r
  v_level := gescatering_internal.lock_level(p_org, p_site_id, p_product_id);\r
\r
  select * into v_res from public.stock_reservations r\r
   where r.source_type = p_source_type and r.source_id = p_source_id\r
     and r.site_id = p_site_id and r.product_id = p_product_id\r
     and r.status = 'active'\r
   for update;\r
\r
  if v_res.id is null then\r
    insert into public.stock_reservations (\r
      organization_id, site_id, product_id, source_type, source_id,\r
      requested_quantity, needed_by, created_by)\r
    values (p_org, p_site_id, p_product_id, p_source_type, p_source_id,\r
            p_requested, p_needed_by, auth.uid())\r
    returning * into v_res;\r
  elsif p_requested < v_res.reserved_quantity + v_res.issued_quantity then\r
    raise exception 'La quantit\xE9 demand\xE9e ne peut pas descendre sous ce qui est d\xE9j\xE0 r\xE9serv\xE9 ou sorti. Lib\xE9rer d''abord la r\xE9servation.'\r
      using errcode = '22023';\r
  else\r
    update public.stock_reservations r\r
       set requested_quantity = p_requested,\r
           needed_by          = coalesce(p_needed_by, r.needed_by)\r
     where r.id = v_res.id\r
     returning * into v_res;\r
  end if;\r
\r
  v_add := least(v_res.requested_quantity - v_res.reserved_quantity - v_res.issued_quantity,\r
                 v_level.on_hand - v_level.reserved);\r
  if v_add > 0 then\r
    update public.stock_levels\r
       set reserved = reserved + v_add, updated_at = now()\r
     where site_id = p_site_id and product_id = p_product_id;\r
    update public.stock_reservations r\r
       set reserved_quantity = r.reserved_quantity + v_add\r
     where r.id = v_res.id\r
     returning * into v_res;\r
  end if;\r
\r
  return v_res;\r
end $$;\r
\r
create or replace function public.reserve_stock(\r
  p_site_id     uuid,\r
  p_product_id  uuid,\r
  p_quantity    numeric,\r
  p_source_type text,\r
  p_source_id   uuid,\r
  p_unit_id     uuid default null,\r
  p_needed_by   date default null\r
)\r
returns table (reservation_id uuid, reserved_quantity numeric,\r
               issued_quantity numeric, shortage numeric)\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_org uuid;\r
  v_res public.stock_reservations;\r
begin\r
  v_org := gescatering_internal.authorize_site(p_site_id, 'stock.reserve');\r
  perform gescatering_internal.assert_product(v_org, p_product_id);\r
  if coalesce(p_quantity, 0) <= 0 then\r
    raise exception 'La quantit\xE9 doit \xEAtre sup\xE9rieure \xE0 z\xE9ro.' using errcode = '22023';\r
  end if;\r
\r
  v_res := gescatering_internal.reserve_core(\r
    v_org, p_site_id, p_product_id,\r
    public.convert_to_stock_unit(p_product_id, p_unit_id, p_quantity),\r
    p_source_type, p_source_id, p_needed_by);\r
\r
  return query select v_res.id, v_res.reserved_quantity, v_res.issued_quantity,\r
    v_res.requested_quantity - v_res.reserved_quantity - v_res.issued_quantity;\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Lib\xE9ration d'une r\xE9servation (besoin annul\xE9 ou r\xE9duit \xE0 z\xE9ro).\r
-- ---------------------------------------------------------------------\r
create or replace function gescatering_internal.release_core(\r
  p_reservation_id uuid,\r
  p_reason         text\r
)\r
returns void\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_res public.stock_reservations;\r
begin\r
  select * into v_res from public.stock_reservations where id = p_reservation_id;\r
  if v_res.id is null then\r
    raise exception 'R\xE9servation introuvable.' using errcode = 'P0002';\r
  end if;\r
  if coalesce(trim(p_reason), '') = '' then\r
    raise exception 'Le motif est obligatoire.' using errcode = '22023';\r
  end if;\r
\r
  perform gescatering_internal.lock_level(v_res.organization_id, v_res.site_id, v_res.product_id);\r
  select * into v_res from public.stock_reservations where id = p_reservation_id for update;\r
  if v_res.status <> 'active' then\r
    raise exception 'Cette r\xE9servation est d\xE9j\xE0 close.' using errcode = '22023';\r
  end if;\r
\r
  update public.stock_levels\r
     set reserved = reserved - v_res.reserved_quantity, updated_at = now()\r
   where site_id = v_res.site_id and product_id = v_res.product_id;\r
\r
  update public.stock_reservations\r
     set status = 'released', reserved_quantity = 0,\r
         close_reason = p_reason, closed_at = now()\r
   where id = p_reservation_id;\r
end $$;\r
\r
create or replace function public.release_reservation(\r
  p_reservation_id uuid,\r
  p_reason         text\r
)\r
returns void\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_site uuid;\r
begin\r
  select site_id into v_site from public.stock_reservations where id = p_reservation_id;\r
  if v_site is null then\r
    raise exception 'R\xE9servation introuvable.' using errcode = 'P0002';\r
  end if;\r
  perform gescatering_internal.authorize_site(v_site, 'stock.reserve');\r
  perform gescatering_internal.release_core(p_reservation_id, p_reason);\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Sortie d'un besoin r\xE9serv\xE9 : diminue le physique ET le r\xE9serv\xE9.\r
-- ---------------------------------------------------------------------\r
create or replace function public.issue_reserved_stock(\r
  p_reservation_id  uuid,\r
  p_quantity        numeric,\r
  p_idempotency_key text default null,\r
  p_unit_id         uuid default null\r
)\r
returns uuid\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_res      public.stock_reservations;\r
  v_qty      numeric;\r
  v_mov      uuid;\r
  v_existing uuid;\r
begin\r
  select * into v_res from public.stock_reservations where id = p_reservation_id;\r
  if v_res.id is null then\r
    raise exception 'R\xE9servation introuvable.' using errcode = 'P0002';\r
  end if;\r
  perform gescatering_internal.authorize_site(v_res.site_id, 'stock.move');\r
\r
  if p_idempotency_key is not null then\r
    select id into v_existing from public.stock_movements\r
     where organization_id = v_res.organization_id and idempotency_key = p_idempotency_key;\r
    if v_existing is not null then return v_existing; end if;\r
  end if;\r
\r
  if coalesce(p_quantity, 0) <= 0 then\r
    raise exception 'La quantit\xE9 doit \xEAtre sup\xE9rieure \xE0 z\xE9ro.' using errcode = '22023';\r
  end if;\r
  v_qty := public.convert_to_stock_unit(v_res.product_id, p_unit_id, p_quantity);\r
\r
  perform gescatering_internal.lock_level(v_res.organization_id, v_res.site_id, v_res.product_id);\r
  select * into v_res from public.stock_reservations where id = p_reservation_id for update;\r
\r
  if v_res.status <> 'active' then\r
    raise exception 'Cette r\xE9servation est close.' using errcode = '22023';\r
  end if;\r
  if v_qty > v_res.reserved_quantity then\r
    raise exception 'On ne peut sortir que la quantit\xE9 r\xE9serv\xE9e (%).',\r
      trim(to_char(v_res.reserved_quantity, 'FM999999990.###'))\r
      using errcode = '22023',\r
            hint = 'Compl\xE9ter d''abord la r\xE9servation avec reserve_stock().';\r
  end if;\r
\r
  v_mov := gescatering_internal.apply_movement(\r
    v_res.organization_id, v_res.site_id, v_res.product_id, 'issue',\r
    -v_qty, -v_qty, p_quantity, p_unit_id, null,\r
    v_res.source_type, v_res.source_id, v_res.id, null, p_idempotency_key);\r
\r
  update public.stock_reservations\r
     set reserved_quantity = reserved_quantity - v_qty,\r
         issued_quantity   = issued_quantity + v_qty,\r
         status    = case when reserved_quantity - v_qty = 0\r
                           and issued_quantity + v_qty >= requested_quantity\r
                          then 'consumed' else 'active' end,\r
         closed_at = case when reserved_quantity - v_qty = 0\r
                           and issued_quantity + v_qty >= requested_quantity\r
                          then now() end\r
   where id = p_reservation_id;\r
\r
  return v_mov;\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Transfert entre deux sites (mode multi-sites).\r
--  Deux mouvements dans la M\xCAME transaction : jamais l'un sans l'autre.\r
-- ---------------------------------------------------------------------\r
create or replace function public.transfer_stock(\r
  p_from_site_id    uuid,\r
  p_to_site_id      uuid,\r
  p_product_id      uuid,\r
  p_quantity        numeric,\r
  p_reason          text,\r
  p_unit_id         uuid default null,\r
  p_idempotency_key text default null\r
)\r
returns uuid\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_org      uuid;\r
  v_org_to   uuid;\r
  v_mode     text;\r
  v_qty      numeric;\r
  v_transfer uuid := gen_random_uuid();\r
  v_existing uuid;\r
begin\r
  v_org    := gescatering_internal.authorize_site(p_from_site_id, 'stock.transfer');\r
  v_org_to := gescatering_internal.authorize_site(p_to_site_id, 'stock.transfer');\r
  if v_org <> v_org_to or p_from_site_id = p_to_site_id then\r
    raise exception 'Transfert impossible entre ces deux sites.' using errcode = '22023';\r
  end if;\r
  select stock_mode into v_mode from public.catering_settings where organization_id = v_org;\r
  if coalesce(v_mode, 'central') <> 'multi_site' then\r
    raise exception 'Les transferts exigent le mode \xAB stock par site \xBB.' using errcode = '22023';\r
  end if;\r
  perform gescatering_internal.assert_product(v_org, p_product_id);\r
  if coalesce(p_quantity, 0) <= 0 then\r
    raise exception 'La quantit\xE9 doit \xEAtre sup\xE9rieure \xE0 z\xE9ro.' using errcode = '22023';\r
  end if;\r
\r
  if p_idempotency_key is not null then\r
    select id into v_existing from public.stock_movements\r
     where organization_id = v_org and idempotency_key = p_idempotency_key || ':out';\r
    if v_existing is not null then return v_existing; end if;\r
  end if;\r
\r
  v_qty := public.convert_to_stock_unit(p_product_id, p_unit_id, p_quantity);\r
\r
  -- Verrous dans un ordre fixe : deux transferts crois\xE9s A\u2192B et B\u2192A ne\r
  -- peuvent pas s'attendre mutuellement (interblocage).\r
  perform gescatering_internal.lock_level(v_org, s, p_product_id)\r
     from unnest(array[p_from_site_id, p_to_site_id]) s order by s;\r
\r
  perform gescatering_internal.apply_movement(\r
    v_org, p_from_site_id, p_product_id, 'transfer_out', -v_qty, 0,\r
    p_quantity, p_unit_id, p_reason, 'transfer', v_transfer, null, null,\r
    p_idempotency_key || ':out');\r
  perform gescatering_internal.apply_movement(\r
    v_org, p_to_site_id, p_product_id, 'transfer_in', v_qty, 0,\r
    p_quantity, p_unit_id, p_reason, 'transfer', v_transfer, null, null,\r
    p_idempotency_key || ':in');\r
  return v_transfer;\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Contre-passation d'un mouvement erron\xE9. L'original reste visible.\r
-- ---------------------------------------------------------------------\r
create or replace function public.reverse_stock_movement(\r
  p_movement_id uuid,\r
  p_reason      text\r
)\r
returns uuid\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_mov public.stock_movements;\r
begin\r
  select * into v_mov from public.stock_movements where id = p_movement_id;\r
  if v_mov.id is null then\r
    raise exception 'Mouvement introuvable.' using errcode = 'P0002';\r
  end if;\r
  perform gescatering_internal.authorize_site(v_mov.site_id, 'stock.adjust');\r
\r
  if coalesce(trim(p_reason), '') = '' then\r
    raise exception 'Le motif est obligatoire.' using errcode = '22023';\r
  end if;\r
  if v_mov.kind = 'reversal' then\r
    raise exception 'Une contre-passation ne se contre-passe pas : enregistrer un ajustement.'\r
      using errcode = '22023';\r
  end if;\r
  if v_mov.reservation_id is not null or v_mov.source_type in ('transfer', 'purchase_order') then\r
    raise exception 'Ce mouvement est li\xE9 \xE0 une r\xE9servation, un transfert ou une r\xE9ception : le corriger depuis son origine.'\r
      using errcode = '22023';\r
  end if;\r
  if exists (select 1 from public.stock_movements where reverses_movement_id = p_movement_id) then\r
    raise exception 'Ce mouvement a d\xE9j\xE0 \xE9t\xE9 contre-pass\xE9.' using errcode = '22023';\r
  end if;\r
\r
  return gescatering_internal.apply_movement(\r
    v_mov.organization_id, v_mov.site_id, v_mov.product_id, 'reversal',\r
    -v_mov.quantity_delta, 0, null, null, p_reason,\r
    v_mov.source_type, v_mov.source_id, null, v_mov.id, null);\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  7. EXPOSITION\r
-- ---------------------------------------------------------------------\r
revoke all on all functions in schema gescatering_internal from public, anon, authenticated;\r
\r
do $$\r
declare f text;\r
begin\r
  foreach f in array array[\r
    'public.record_stock_movement(uuid, uuid, text, numeric, uuid, text, text, text, uuid)',\r
    'public.reserve_stock(uuid, uuid, numeric, text, uuid, uuid, date)',\r
    'public.release_reservation(uuid, text)',\r
    'public.issue_reserved_stock(uuid, numeric, text, uuid)',\r
    'public.transfer_stock(uuid, uuid, uuid, numeric, text, uuid, text)',\r
    'public.reverse_stock_movement(uuid, text)'\r
  ] loop\r
    execute format('revoke all on function %s from public, anon', f);\r
    execute format('grant execute on function %s to authenticated', f);\r
  end loop;\r
end $$;\r
`},{name:"migrations/C0004__purchasing_receiving.sql",sql:`-- =====================================================================
--  C0004 \u2014 Commandes fournisseurs et r\xE9ceptions
--
--  Cycle de vie (statut modifiable UNIQUEMENT par les RPC) :
--
--    draft \u2500\u2500submit\u2500\u2500\u25BA pending_approval \u2500\u2500approve\u2500\u2500\u25BA approved \u2500\u2500order\u2500\u2500\u25BA ordered
--      \u25B2                     \u2502 refus                                    \u2502
--      \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518                      r\xE9ception partielle \u25BC
--                                        partially_received \u2500\u2500\u25BA received
--    draft | pending_approval | approved \u2500\u2500cancel\u2500\u2500\u25BA cancelled
--
--  \u26A0\uFE0F Rien ne passe une commande tout seul. Une suggestion de quantit\xE9 ou
--     de fournisseur produit au mieux un BROUILLON ; le passage \xE0
--     \xAB command\xE9e \xBB est un geste explicite d'une personne habilit\xE9e
--     (\`purchase.order\`), sur une commande valid\xE9e.
--
--  R\xE9ception :
--    \u2022 partielle autoris\xE9e, reliquat identifiable ligne par ligne ;
--    \u2022 plus que le restant : REFUS\xC9 (\xE9cart \xE0 signaler, pas \xE0 absorber) ;
--    \u2022 cl\xE9 d'idempotence obligatoire \u2192 la m\xEAme r\xE9ception ne s'enregistre
--      jamais deux fois, m\xEAme en cas de double envoi ;
--    \u2022 la commande est verrouill\xE9e pendant la r\xE9ception : deux r\xE9ceptions
--      simultan\xE9es s'ex\xE9cutent l'une apr\xE8s l'autre.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. NUM\xC9ROTATION (BC-2026-0001), sans trou ni doublon par organisation
-- ---------------------------------------------------------------------
create table if not exists public.document_counters (
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  doc_type        text not null,
  year            integer not null,
  last_value      integer not null default 0,
  primary key (organization_id, doc_type, year)
);
alter table public.document_counters enable row level security;
revoke all on public.document_counters from anon, authenticated;

create or replace function gescatering_internal.next_reference(
  p_org uuid, p_doc_type text, p_prefix text
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_year  integer := extract(year from now())::integer;
  v_value integer;
begin
  insert into public.document_counters (organization_id, doc_type, year, last_value)
  values (p_org, p_doc_type, v_year, 1)
  on conflict (organization_id, doc_type, year)
  do update set last_value = public.document_counters.last_value + 1
  returning last_value into v_value;
  return format('%s-%s-%s', p_prefix, v_year, lpad(v_value::text, 4, '0'));
end $$;

-- ---------------------------------------------------------------------
--  2. COMMANDES
-- ---------------------------------------------------------------------
create table if not exists public.purchase_orders (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references platform.organizations(id) on delete cascade,
  reference        text,
  supplier_id      uuid,
  site_id          uuid not null,             -- site de livraison
  status           text not null default 'draft' check (status in (
                     'draft', 'pending_approval', 'approved', 'ordered',
                     'partially_received', 'received', 'cancelled')),
  expected_date    date,
  notes            text,
  created_by       uuid references auth.users(id) on delete set null default auth.uid(),
  submitted_at     timestamptz,
  approved_by      uuid references auth.users(id) on delete set null,
  approved_at      timestamptz,
  approval_mode    text check (approval_mode in ('manual', 'below_threshold')),
  rejection_reason text,
  ordered_by       uuid references auth.users(id) on delete set null,
  ordered_at       timestamptz,
  cancelled_by     uuid references auth.users(id) on delete set null,
  cancelled_at     timestamptz,
  cancel_reason    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint uq_po_id_org unique (id, organization_id),
  constraint uq_po_reference unique (organization_id, reference),
  constraint fk_po_supplier foreign key (supplier_id, organization_id)
    references public.suppliers (id, organization_id),
  constraint fk_po_site foreign key (site_id, organization_id)
    references public.sites (id, organization_id)
);
create index if not exists idx_po_status on public.purchase_orders (organization_id, status);

create table if not exists public.purchase_order_lines (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references platform.organizations(id) on delete cascade,
  purchase_order_id   uuid not null,
  product_id          uuid not null,
  unit_id             uuid references public.units(id),  -- unit\xE9 command\xE9e (null = unit\xE9 de stock)
  quantity            numeric(14,3) not null check (quantity > 0),
  unit_price          numeric(14,2) check (unit_price >= 0),   -- prix par unit_id
  -- Calcul\xE9s par la base, jamais saisis par le client :
  quantity_stock      numeric(14,3) not null default 0,  -- command\xE9, en unit\xE9 de stock
  received_quantity   numeric(14,3) not null default 0,  -- re\xE7u, en unit\xE9 de stock
  note                text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint uq_pol_id_org unique (id, organization_id),
  constraint ck_pol_received check (received_quantity >= 0 and received_quantity <= quantity_stock),
  constraint fk_pol_po foreign key (purchase_order_id, organization_id)
    references public.purchase_orders (id, organization_id) on delete cascade,
  constraint fk_pol_product foreign key (product_id, organization_id)
    references public.products (id, organization_id)
);
create index if not exists idx_pol_po on public.purchase_order_lines (purchase_order_id);
create index if not exists idx_pol_product on public.purchase_order_lines (product_id);

-- Conversion en unit\xE9 de stock au moment de la saisie : une conversion
-- inconnue est refus\xE9e d\xE8s le brouillon, pas d\xE9couverte \xE0 la r\xE9ception.
create or replace function gescatering_internal.compute_line_stock_quantity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.quantity_stock := public.convert_to_stock_unit(new.product_id, new.unit_id, new.quantity);
  if tg_op = 'INSERT' then
    new.received_quantity := 0;
  end if;
  return new;
end $$;

drop trigger if exists trg_pol_stock_quantity on public.purchase_order_lines;
create trigger trg_pol_stock_quantity
  before insert or update of product_id, unit_id, quantity on public.purchase_order_lines
  for each row execute function gescatering_internal.compute_line_stock_quantity();

-- ---------------------------------------------------------------------
--  3. R\xC9CEPTIONS
-- ---------------------------------------------------------------------
create table if not exists public.receipts (
  id                 uuid primary key default gen_random_uuid(),
  organization_id    uuid not null references platform.organizations(id) on delete cascade,
  purchase_order_id  uuid not null,
  site_id            uuid not null,
  delivery_note_ref  text,               -- num\xE9ro du bon de livraison
  comment            text,
  idempotency_key    text not null,
  received_by        uuid references auth.users(id) on delete set null,
  received_at        timestamptz not null default now(),
  constraint uq_receipt_idempotency unique (organization_id, idempotency_key),
  constraint uq_receipt_id_org unique (id, organization_id),
  constraint fk_receipt_po foreign key (purchase_order_id, organization_id)
    references public.purchase_orders (id, organization_id),
  constraint fk_receipt_site foreign key (site_id, organization_id)
    references public.sites (id, organization_id)
);

create table if not exists public.receipt_lines (
  id                     uuid primary key default gen_random_uuid(),
  organization_id        uuid not null references platform.organizations(id) on delete cascade,
  receipt_id             uuid not null,
  purchase_order_line_id uuid not null,
  quantity               numeric(14,3) not null check (quantity > 0),  -- unit\xE9 de stock
  remaining_after        numeric(14,3) not null,                       -- reliquat apr\xE8s cette r\xE9ception
  discrepancy_note       text,
  movement_id            uuid not null references public.stock_movements(id),
  constraint fk_rl_receipt foreign key (receipt_id, organization_id)
    references public.receipts (id, organization_id),
  constraint fk_rl_line foreign key (purchase_order_line_id, organization_id)
    references public.purchase_order_lines (id, organization_id)
);

-- Une r\xE9ception est un fait : elle ne se modifie ni ne se supprime.
drop trigger if exists trg_receipts_immutable on public.receipts;
create trigger trg_receipts_immutable before update or delete or truncate on public.receipts
  for each statement execute function gescatering_internal.forbid_movement_mutation();
drop trigger if exists trg_receipt_lines_immutable on public.receipt_lines;
create trigger trg_receipt_lines_immutable before update or delete or truncate on public.receipt_lines
  for each statement execute function gescatering_internal.forbid_movement_mutation();

-- ---------------------------------------------------------------------
--  4. TRIGGERS DU SOCLE + AUDIT
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['purchase_orders','purchase_order_lines'] loop
    perform platform.attach_updated_at('public', t);
    perform platform.attach_org_immutability('public', t);
    perform platform.attach_org_default('public', t);
  end loop;
end $$;
select platform.attach_audit('public', 'purchase_orders');
select platform.attach_audit('public', 'purchase_order_lines');

-- ---------------------------------------------------------------------
--  5. RLS
--
--  Brouillon : saisi par les achats (insert/update directs, colonnes
--  limit\xE9es). Tout le reste \u2014 statut, validation, r\xE9ception \u2014 par RPC.
-- ---------------------------------------------------------------------
alter table public.purchase_orders      enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.receipts             enable row level security;
alter table public.receipt_lines        enable row level security;

revoke all on public.purchase_orders, public.purchase_order_lines,
              public.receipts, public.receipt_lines from anon, authenticated;
grant select on public.purchase_orders, public.purchase_order_lines,
                public.receipts, public.receipt_lines to authenticated;

-- Droits par COLONNE : le client ne peut ni fixer un statut, ni s'attribuer
-- une validation, ni d\xE9clarer une quantit\xE9 re\xE7ue.
grant insert (organization_id, supplier_id, site_id, expected_date, notes)
  on public.purchase_orders to authenticated;
grant update (supplier_id, site_id, expected_date, notes)
  on public.purchase_orders to authenticated;
grant insert (organization_id, purchase_order_id, product_id, unit_id, quantity, unit_price, note)
  on public.purchase_order_lines to authenticated;
grant update (product_id, unit_id, quantity, unit_price, note)
  on public.purchase_order_lines to authenticated;
grant delete on public.purchase_order_lines to authenticated;

drop policy if exists purchase_orders_select on public.purchase_orders;
create policy purchase_orders_select on public.purchase_orders
  for select to authenticated
  using (
        platform.has_permission(organization_id, 'purchase.read')
    and platform.in_scope(organization_id, 'site', site_id));

drop policy if exists purchase_orders_insert on public.purchase_orders;
create policy purchase_orders_insert on public.purchase_orders
  for insert to authenticated
  with check (
        status = 'draft'
    and platform.has_permission(organization_id, 'purchase.prepare')
    and platform.in_scope(organization_id, 'site', site_id));

drop policy if exists purchase_orders_update on public.purchase_orders;
create policy purchase_orders_update on public.purchase_orders
  for update to authenticated
  using (
        status = 'draft'
    and platform.has_permission(organization_id, 'purchase.prepare')
    and platform.in_scope(organization_id, 'site', site_id))
  with check (
        status = 'draft'
    and platform.has_permission(organization_id, 'purchase.prepare')
    and platform.in_scope(organization_id, 'site', site_id));

-- Lignes : modifiables uniquement tant que la commande est un brouillon.
create or replace function gescatering_internal.po_is_editable_draft(p_po_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.purchase_orders po
     where po.id = p_po_id
       and po.status = 'draft'
       and platform.has_permission(po.organization_id, 'purchase.prepare')
       and platform.in_scope(po.organization_id, 'site', po.site_id));
$$;
grant usage on schema gescatering_internal to authenticated;
grant execute on function gescatering_internal.po_is_editable_draft(uuid) to authenticated;

drop policy if exists pol_select on public.purchase_order_lines;
create policy pol_select on public.purchase_order_lines
  for select to authenticated
  using (exists (select 1 from public.purchase_orders po
                  where po.id = purchase_order_id));   -- h\xE9rite de la RLS de la commande
drop policy if exists pol_insert on public.purchase_order_lines;
create policy pol_insert on public.purchase_order_lines
  for insert to authenticated
  with check (gescatering_internal.po_is_editable_draft(purchase_order_id));
drop policy if exists pol_update on public.purchase_order_lines;
create policy pol_update on public.purchase_order_lines
  for update to authenticated
  using      (gescatering_internal.po_is_editable_draft(purchase_order_id))
  with check (gescatering_internal.po_is_editable_draft(purchase_order_id));
drop policy if exists pol_delete on public.purchase_order_lines;
create policy pol_delete on public.purchase_order_lines
  for delete to authenticated
  using (gescatering_internal.po_is_editable_draft(purchase_order_id));

drop policy if exists receipts_select on public.receipts;
create policy receipts_select on public.receipts
  for select to authenticated
  using (
        (platform.has_permission(organization_id, 'purchase.read')
         or platform.has_permission(organization_id, 'stock.read'))
    and platform.in_scope(organization_id, 'site', site_id));
drop policy if exists receipt_lines_select on public.receipt_lines;
create policy receipt_lines_select on public.receipt_lines
  for select to authenticated
  using (exists (select 1 from public.receipts r where r.id = receipt_id));

-- R\xE9f\xE9rence attribu\xE9e \xE0 la cr\xE9ation, par la base.
create or replace function gescatering_internal.assign_po_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.reference := gescatering_internal.next_reference(new.organization_id, 'purchase_order', 'BC');
  return new;
end $$;

drop trigger if exists trg_po_reference on public.purchase_orders;
create trigger trg_po_reference before insert on public.purchase_orders
  for each row execute function gescatering_internal.assign_po_reference();

-- =====================================================================
--  6. RPC DU CYCLE DE VIE
-- =====================================================================

-- Charge et verrouille une commande, contr\xF4le la permission et le p\xE9rim\xE8tre.
create or replace function gescatering_internal.lock_po(p_po_id uuid, p_permission text)
returns public.purchase_orders
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_po public.purchase_orders;
begin
  select * into v_po from public.purchase_orders where id = p_po_id for update;
  if v_po.id is null or not (v_po.organization_id = any (platform.current_org_ids())) then
    raise exception 'Commande introuvable.' using errcode = 'P0002';
  end if;
  if not platform.has_permission(v_po.organization_id, p_permission) then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : vous n''avez pas le droit de faire cela.');
  end if;
  if not platform.in_scope(v_po.organization_id, 'site', v_po.site_id) then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : ce site ne fait pas partie de votre p\xE9rim\xE8tre.');
  end if;
  return v_po;
end $$;

-- Soumission : validation requise sauf montant sous le seuil configur\xE9.
create or replace function public.submit_purchase_order(p_po_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_po        public.purchase_orders;
  v_threshold numeric;
  v_total     numeric;
  v_unpriced  boolean;
begin
  v_po := gescatering_internal.lock_po(p_po_id, 'purchase.prepare');
  if v_po.status <> 'draft' then
    raise exception 'Seul un brouillon peut \xEAtre soumis.' using errcode = '22023';
  end if;
  if v_po.supplier_id is null then
    raise exception 'Choisir un fournisseur avant de soumettre.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.purchase_order_lines where purchase_order_id = p_po_id) then
    raise exception 'La commande est vide.' using errcode = '22023';
  end if;

  select coalesce(purchase_approval_threshold, 0) into v_threshold
    from public.catering_settings where organization_id = v_po.organization_id;
  select coalesce(sum(quantity * unit_price), 0), bool_or(unit_price is null)
    into v_total, v_unpriced
    from public.purchase_order_lines where purchase_order_id = p_po_id;

  if coalesce(v_threshold, 0) > 0 and not v_unpriced and v_total < v_threshold then
    update public.purchase_orders
       set status = 'approved', submitted_at = now(), approved_at = now(),
           approval_mode = 'below_threshold', rejection_reason = null
     where id = p_po_id;
    return 'approved';
  end if;

  update public.purchase_orders
     set status = 'pending_approval', submitted_at = now(), rejection_reason = null
   where id = p_po_id;
  return 'pending_approval';
end $$;

-- Validation ou refus par la direction d'exploitation.
create or replace function public.approve_purchase_order(
  p_po_id   uuid,
  p_approve boolean,
  p_comment text default null
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_po public.purchase_orders;
begin
  v_po := gescatering_internal.lock_po(p_po_id, 'purchase.approve');
  if v_po.status <> 'pending_approval' then
    raise exception 'Cette commande n''est pas en attente de validation.' using errcode = '22023';
  end if;
  -- S\xE9paration des t\xE2ches : on ne valide pas sa propre commande, sauf
  -- l'administration de l'organisation (petites structures).
  if v_po.created_by = auth.uid()
     and not platform.has_permission(v_po.organization_id, 'organization.manage') then
    perform gescatering_internal.deny('Vous ne pouvez pas valider une commande que vous avez pr\xE9par\xE9e.');
  end if;

  if p_approve then
    update public.purchase_orders
       set status = 'approved', approved_by = auth.uid(), approved_at = now(),
           approval_mode = 'manual'
     where id = p_po_id;
    return 'approved';
  end if;

  if coalesce(trim(p_comment), '') = '' then
    raise exception 'Indiquer le motif du refus.' using errcode = '22023';
  end if;
  update public.purchase_orders
     set status = 'draft', rejection_reason = p_comment, submitted_at = null
   where id = p_po_id;
  return 'draft';
end $$;

-- Passage de la commande au fournisseur : geste humain explicite.
create or replace function public.mark_purchase_order_ordered(
  p_po_id         uuid,
  p_expected_date date default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_po public.purchase_orders;
begin
  v_po := gescatering_internal.lock_po(p_po_id, 'purchase.order');
  if v_po.status <> 'approved' then
    raise exception 'Seule une commande valid\xE9e peut \xEAtre pass\xE9e.' using errcode = '22023';
  end if;
  update public.purchase_orders
     set status = 'ordered', ordered_by = auth.uid(), ordered_at = now(),
         expected_date = coalesce(p_expected_date, expected_date)
   where id = p_po_id;
end $$;

create or replace function public.cancel_purchase_order(p_po_id uuid, p_reason text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_po public.purchase_orders;
begin
  select * into v_po from public.purchase_orders where id = p_po_id;
  if v_po.id is not null
     and platform.has_permission(v_po.organization_id, 'purchase.approve') then
    v_po := gescatering_internal.lock_po(p_po_id, 'purchase.approve');
  else
    v_po := gescatering_internal.lock_po(p_po_id, 'purchase.prepare');
  end if;
  if v_po.status not in ('draft', 'pending_approval', 'approved', 'ordered') then
    raise exception 'Cette commande ne peut plus \xEAtre annul\xE9e.' using errcode = '22023';
  end if;
  if exists (select 1 from public.purchase_order_lines
              where purchase_order_id = p_po_id and received_quantity > 0) then
    raise exception 'Une commande d\xE9j\xE0 partiellement re\xE7ue ne s''annule pas.' using errcode = '22023';
  end if;
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Le motif est obligatoire.' using errcode = '22023';
  end if;
  update public.purchase_orders
     set status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now(),
         cancel_reason = p_reason
   where id = p_po_id;
end $$;

-- ---------------------------------------------------------------------
--  R\xE9ception (totale ou partielle).
--  p_lines : [{"line_id": "...", "quantity": 60, "unit_id": null, "note": "..."}]
-- ---------------------------------------------------------------------
create or replace function public.receive_purchase_order(
  p_po_id             uuid,
  p_lines             jsonb,
  p_idempotency_key   text,
  p_delivery_note_ref text default null,
  p_comment           text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_po        public.purchase_orders;
  v_receipt   uuid;
  v_item      jsonb;
  v_line      public.purchase_order_lines;
  v_qty       numeric;
  v_remaining numeric;
  v_mov       uuid;
  v_name      text;
begin
  if coalesce(trim(p_idempotency_key), '') = '' then
    raise exception 'Cl\xE9 d''idempotence obligatoire pour une r\xE9ception.' using errcode = '22023';
  end if;

  -- Verrou de la commande : s\xE9rialise les r\xE9ceptions concurrentes.
  v_po := gescatering_internal.lock_po(p_po_id, 'reception.record');

  -- R\xE9ception d\xE9j\xE0 enregistr\xE9e (double envoi) : on renvoie la premi\xE8re.
  select id into v_receipt from public.receipts
   where organization_id = v_po.organization_id and idempotency_key = p_idempotency_key;
  if v_receipt is not null then
    return v_receipt;
  end if;

  if v_po.status not in ('ordered', 'partially_received') then
    raise exception 'Cette commande n''est pas en attente de livraison (statut : %).', v_po.status
      using errcode = '22023';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'Aucune quantit\xE9 re\xE7ue.' using errcode = '22023';
  end if;

  insert into public.receipts (organization_id, purchase_order_id, site_id,
                               delivery_note_ref, comment, idempotency_key, received_by)
  values (v_po.organization_id, p_po_id, v_po.site_id,
          p_delivery_note_ref, p_comment, p_idempotency_key, auth.uid())
  returning id into v_receipt;

  for v_item in select * from jsonb_array_elements(p_lines) loop
    select * into v_line from public.purchase_order_lines
     where id = (v_item ->> 'line_id')::uuid and purchase_order_id = p_po_id
     for update;
    if v_line.id is null then
      raise exception 'Ligne de commande introuvable.' using errcode = 'P0002';
    end if;

    v_qty := public.convert_to_stock_unit(
               v_line.product_id,
               nullif(v_item ->> 'unit_id', '')::uuid,
               (v_item ->> 'quantity')::numeric);
    continue when coalesce(v_qty, 0) = 0;
    if v_qty < 0 then
      raise exception 'Quantit\xE9 re\xE7ue n\xE9gative.' using errcode = '22023';
    end if;

    v_remaining := v_line.quantity_stock - v_line.received_quantity;
    if v_qty > v_remaining then
      select name into v_name from public.products where id = v_line.product_id;
      raise exception '\xC9cart sur \xAB % \xBB : livr\xE9 %, restant \xE0 recevoir %. Signaler l''\xE9cart au service achats.',
        v_name,
        trim(to_char(v_qty, 'FM999999990.###')),
        trim(to_char(v_remaining, 'FM999999990.###'))
        using errcode = '22023';
    end if;

    v_mov := gescatering_internal.apply_movement(
      v_po.organization_id, v_po.site_id, v_line.product_id, 'receipt', v_qty, 0,
      (v_item ->> 'quantity')::numeric, nullif(v_item ->> 'unit_id', '')::uuid,
      'R\xE9ception ' || coalesce(v_po.reference, ''),
      'purchase_order', p_po_id, null, null,
      p_idempotency_key || ':' || v_line.id::text);

    update public.purchase_order_lines
       set received_quantity = received_quantity + v_qty
     where id = v_line.id;

    insert into public.receipt_lines (organization_id, receipt_id, purchase_order_line_id,
                                      quantity, remaining_after, discrepancy_note, movement_id)
    values (v_po.organization_id, v_receipt, v_line.id,
            v_qty, v_remaining - v_qty, v_item ->> 'note', v_mov);
  end loop;

  if not exists (select 1 from public.receipt_lines where receipt_id = v_receipt) then
    raise exception 'Aucune quantit\xE9 re\xE7ue.' using errcode = '22023';
  end if;

  update public.purchase_orders
     set status = case
           when exists (select 1 from public.purchase_order_lines
                         where purchase_order_id = p_po_id
                           and received_quantity < quantity_stock)
           then 'partially_received' else 'received' end
   where id = p_po_id;

  return v_receipt;
end $$;

-- =====================================================================
--  7. POSITION DE STOCK \u2014 la vue de r\xE9f\xE9rence de tous les \xE9crans
--
--  Les quatre quantit\xE9s sont pr\xE9sent\xE9es C\xD4TE \xC0 C\xD4TE, jamais additionn\xE9es :
--  physique, r\xE9serv\xE9, disponible, attendu. \`projected\` est une projection
--  explicite (disponible + attendu), \xE0 afficher comme telle.
-- =====================================================================
create or replace view public.v_stock_position
with (security_invoker = true)
as
with on_order as (
  select po.organization_id, po.site_id, l.product_id,
         sum(l.quantity_stock - l.received_quantity) as quantity,
         min(po.expected_date)                       as next_expected_date
    from public.purchase_orders po
    join public.purchase_order_lines l on l.purchase_order_id = po.id
   where po.status in ('ordered', 'partially_received')
     and l.quantity_stock > l.received_quantity
   group by po.organization_id, po.site_id, l.product_id
)
select
  s.organization_id,
  s.id                                   as site_id,
  s.name                                 as site_name,
  p.id                                   as product_id,
  p.reference,
  p.name                                 as product_name,
  p.category_id,
  u.code                                 as unit_code,
  coalesce(l.on_hand, 0)                 as on_hand,
  coalesce(l.reserved, 0)                as reserved,
  coalesce(l.on_hand, 0) - coalesce(l.reserved, 0) as available,
  coalesce(o.quantity, 0)                as on_order,
  o.next_expected_date,
  coalesce(l.on_hand, 0) - coalesce(l.reserved, 0) + coalesce(o.quantity, 0) as projected,
  p.min_stock,
  (coalesce(l.on_hand, 0) - coalesce(l.reserved, 0)) < p.min_stock as below_min
from public.sites s
join public.products p on p.organization_id = s.organization_id and p.is_active
join public.units u on u.id = p.stock_unit_id
left join public.stock_levels l on l.site_id = s.id and l.product_id = p.id
left join on_order o on o.site_id = s.id and o.product_id = p.id
where s.holds_stock and s.is_active
  and platform.has_permission(s.organization_id, 'stock.read')
  and platform.in_scope(s.organization_id, 'site', s.id);

revoke all on public.v_stock_position from anon;
grant select on public.v_stock_position to authenticated;

-- ---------------------------------------------------------------------
--  8. EXPOSITION
-- ---------------------------------------------------------------------
revoke all on function gescatering_internal.next_reference(uuid, text, text) from public, anon, authenticated;
revoke all on function gescatering_internal.compute_line_stock_quantity() from public, anon, authenticated;
revoke all on function gescatering_internal.assign_po_reference() from public, anon, authenticated;
revoke all on function gescatering_internal.lock_po(uuid, text) from public, anon, authenticated;

do $$
declare f text;
begin
  foreach f in array array[
    'public.submit_purchase_order(uuid)',
    'public.approve_purchase_order(uuid, boolean, text)',
    'public.mark_purchase_order_ordered(uuid, date)',
    'public.cancel_purchase_order(uuid, text)',
    'public.receive_purchase_order(uuid, jsonb, text, text, text)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
`},{name:"migrations/C0005__catalog_import.sql",sql:`-- =====================================================================
--  C0005 \u2014 Import du catalogue : pr\xE9visualisation, contr\xF4le, confirmation
--
--  Deux temps, jamais confondus :
--
--   1. stage_catalog_import()   \u2192 lot en PR\xC9VISUALISATION. Chaque ligne
--      est contr\xF4l\xE9e PAR LA BASE (unit\xE9 inconnue, doublon avec le catalogue
--      ou dans le lot, r\xE9f\xE9rence prise\u2026) et re\xE7oit un statut ok / warning /
--      error avec des messages lisibles. Rien n'est cr\xE9\xE9.
--   2. confirm_catalog_import() \u2192 cr\xE9e cat\xE9gories, produits et conversions
--      en UNE transaction. Refus\xE9e s'il reste une erreur. Un lot ne se
--      confirme qu'une fois.
--
--  Les contr\xF4les vivent ici, pas dans l'outil qui lit l'Excel : la future
--  interface d'import appliquera exactement les m\xEAmes r\xE8gles.
--
--  \u26A0\uFE0F Une conversion de conditionnement issue d'un import (\xAB sac de 25 kg \xBB)
--     est cr\xE9\xE9e NON VALID\xC9E : une donn\xE9e de fichier n'est pas une donn\xE9e
--     fiable tant qu'une personne ne l'a pas confirm\xE9e.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. Conditionnements rencontr\xE9s dans les fichiers de SESA
-- ---------------------------------------------------------------------
insert into public.units (organization_id, code, label, dimension, factor_to_base) values
  (null, 'seau',      'seau',      'package', null),
  (null, 'pot',       'pot',       'package', null),
  (null, 'bouteille', 'bouteille', 'package', null),
  (null, 'tablette',  'tablette',  'package', null),
  (null, 'pack',      'pack',      'package', null),
  (null, 'tas',       'tas',       'package', null),
  (null, 'bassine',   'bassine',   'package', null),
  (null, 'barre',     'barre',     'package', null)
on conflict on constraint uq_units_code do update
  set label = excluded.label;

-- ---------------------------------------------------------------------
--  2. Tra\xE7abilit\xE9 des imports
-- ---------------------------------------------------------------------
create table if not exists public.import_batches (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  kind            text not null check (kind in ('catalog')),
  file_name       text not null,
  status          text not null default 'preview'
                    check (status in ('preview', 'confirmed', 'cancelled')),
  row_count       integer not null default 0,
  error_count     integer not null default 0,
  warning_count   integer not null default 0,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  confirmed_by    uuid references auth.users(id) on delete set null,
  confirmed_at    timestamptz,
  result          jsonb,
  constraint uq_import_batches_id_org unique (id, organization_id)
);

create table if not exists public.import_rows (
  id                 uuid primary key default gen_random_uuid(),
  organization_id    uuid not null references platform.organizations(id) on delete cascade,
  batch_id           uuid not null,
  row_number         integer not null,
  source             text,            -- ex. \xAB FROID ligne 7 \xBB
  data               jsonb not null,
  status             text not null default 'ok' check (status in ('ok', 'warning', 'error')),
  messages           text[] not null default '{}',
  created_product_id uuid references public.products(id),
  constraint uq_import_row unique (batch_id, row_number),
  constraint fk_import_rows_batch foreign key (batch_id, organization_id)
    references public.import_batches (id, organization_id) on delete cascade
);

select platform.attach_org_immutability('public', 'import_batches');
select platform.attach_org_immutability('public', 'import_rows');
select platform.attach_audit('public', 'import_batches');

alter table public.import_batches enable row level security;
alter table public.import_rows    enable row level security;
revoke all on public.import_batches, public.import_rows from anon, authenticated;
grant select on public.import_batches, public.import_rows to authenticated;

drop policy if exists import_batches_select on public.import_batches;
create policy import_batches_select on public.import_batches
  for select to authenticated
  using (platform.has_permission(organization_id, 'catalog.manage'));
drop policy if exists import_rows_select on public.import_rows;
create policy import_rows_select on public.import_rows
  for select to authenticated
  using (platform.has_permission(organization_id, 'catalog.manage'));

-- ---------------------------------------------------------------------
--  3. Normalisation d'un nom \u2014 la m\xEAme que l'index d'unicit\xE9 des produits
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.name_key(p_name text)
returns text
language sql
immutable
as $$ select lower(regexp_replace(trim(p_name), '\\s+', ' ', 'g')) $$;

-- Unit\xE9 visible par l'organisation (r\xE9f\xE9rence partag\xE9e ou unit\xE9 maison).
create or replace function gescatering_internal.unit_id(p_org uuid, p_code text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.units
   where code = lower(trim(p_code))
     and (organization_id is null or organization_id = p_org)
   order by organization_id nulls last
   limit 1;
$$;

-- ---------------------------------------------------------------------
--  4. Contr\xF4le de toutes les lignes d'un lot
--
--  Ligne attendue :
--  { "reference", "name", "category", "category_kind",
--    "stock_unit", "purchase_unit", "package_factor" }
--  package_factor : quantit\xE9 d'unit\xE9 de stock dans 1 unit\xE9 d'achat.
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.validate_catalog_batch(p_batch_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org   uuid;
  r       public.import_rows;
  v_msgs  text[];
  v_err   boolean;
  v_warn  boolean;
  v_su    uuid;
  v_pu    uuid;
  v_pdim  text;
  v_sdim  text;
  v_fact  numeric;
  v_hit   text;
begin
  select organization_id into v_org from public.import_batches where id = p_batch_id;

  for r in select * from public.import_rows where batch_id = p_batch_id order by row_number loop
    v_msgs := '{}'; v_err := false; v_warn := false;

    if coalesce(trim(r.data ->> 'name'), '') = '' then
      v_msgs := array_append(v_msgs, ('Nom manquant.')::text); v_err := true;
    end if;
    if coalesce(trim(r.data ->> 'reference'), '') = '' then
      v_msgs := array_append(v_msgs, ('R\xE9f\xE9rence manquante.')::text); v_err := true;
    end if;
    if coalesce(trim(r.data ->> 'category'), '') = '' then
      v_msgs := array_append(v_msgs, ('Cat\xE9gorie manquante.')::text); v_err := true;
    elsif not exists (select 1 from public.product_categories
                       where organization_id = v_org
                         and lower(trim(name)) = lower(trim(r.data ->> 'category'))) then
      v_msgs := array_append(v_msgs, (format('Nouvelle cat\xE9gorie \xAB %s \xBB : elle sera cr\xE9\xE9e.', trim(r.data ->> 'category')))::text);
      v_warn := true;
    end if;

    v_su := gescatering_internal.unit_id(v_org, r.data ->> 'stock_unit');
    if v_su is null then
      v_msgs := array_append(v_msgs, (format('Unit\xE9 de stock non reconnue : \xAB %s \xBB.', coalesce(r.data ->> 'stock_unit', '')))::text);
      v_err := true;
    end if;
    v_pu := null;
    if coalesce(trim(r.data ->> 'purchase_unit'), '') <> '' then
      v_pu := gescatering_internal.unit_id(v_org, r.data ->> 'purchase_unit');
      if v_pu is null then
        v_msgs := array_append(v_msgs, (format('Unit\xE9 d''achat non reconnue : \xAB %s \xBB.', r.data ->> 'purchase_unit'))::text);
        v_err := true;
      end if;
    end if;

    -- Contenu d'un conditionnement
    if coalesce(trim(r.data ->> 'package_factor'), '') <> '' then
      begin
        v_fact := (r.data ->> 'package_factor')::numeric;
      exception when others then
        v_fact := null;
      end;
      select dimension into v_pdim from public.units where id = v_pu;
      if v_fact is null or v_fact <= 0 then
        v_msgs := array_append(v_msgs, ('Contenu du conditionnement invalide.')::text); v_err := true;
      elsif v_pu is null or v_pu = v_su then
        v_msgs := array_append(v_msgs, ('Contenu indiqu\xE9 sans unit\xE9 d''achat distincte : ignor\xE9.')::text); v_warn := true;
      elsif v_pdim <> 'package' then
        v_msgs := array_append(v_msgs, ('Unit\xE9 d''achat de mesure : la conversion est d\xE9j\xE0 connue, contenu ignor\xE9.')::text); v_warn := true;
      end if;
    elsif v_pu is not null and v_su is not null and v_pu <> v_su then
      select dimension into v_pdim from public.units where id = v_pu;
      select dimension into v_sdim from public.units where id = v_su;
      if v_pdim = 'package' or v_pdim <> v_sdim then
        v_msgs := array_append(v_msgs, ('Contenu du conditionnement inconnu : les achats dans cette unit\xE9 seront refus\xE9s tant qu''il n''est pas renseign\xE9.')::text);
        v_warn := true;
      end if;
    end if;

    -- Doublons avec le catalogue existant
    select p.name || ' (' || p.reference || ')' into v_hit from public.products p
     where p.organization_id = v_org
       and gescatering_internal.name_key(p.name) = gescatering_internal.name_key(r.data ->> 'name');
    if v_hit is not null then
      v_msgs := array_append(v_msgs, (format('D\xE9j\xE0 au catalogue : %s.', v_hit))::text); v_err := true;
    end if;
    if exists (select 1 from public.products p
                where p.organization_id = v_org and p.reference = trim(r.data ->> 'reference')) then
      v_msgs := array_append(v_msgs, ('R\xE9f\xE9rence d\xE9j\xE0 utilis\xE9e dans le catalogue.')::text); v_err := true;
    end if;

    -- Doublons dans le lot lui-m\xEAme
    if exists (select 1 from public.import_rows o
                where o.batch_id = p_batch_id and o.row_number <> r.row_number
                  and gescatering_internal.name_key(o.data ->> 'name')
                      = gescatering_internal.name_key(r.data ->> 'name')) then
      v_msgs := array_append(v_msgs, ('Nom en double dans le fichier.')::text); v_err := true;
    end if;
    if exists (select 1 from public.import_rows o
                where o.batch_id = p_batch_id and o.row_number <> r.row_number
                  and trim(o.data ->> 'reference') = trim(r.data ->> 'reference')) then
      v_msgs := array_append(v_msgs, ('R\xE9f\xE9rence en double dans le fichier.')::text); v_err := true;
    end if;

    update public.import_rows
       set messages = v_msgs,
           status = case when v_err then 'error' when v_warn then 'warning' else 'ok' end
     where id = r.id;
  end loop;

  update public.import_batches b
     set row_count     = (select count(*) from public.import_rows where batch_id = b.id),
         error_count   = (select count(*) from public.import_rows where batch_id = b.id and status = 'error'),
         warning_count = (select count(*) from public.import_rows where batch_id = b.id and status = 'warning')
   where b.id = p_batch_id;
end $$;

-- ---------------------------------------------------------------------
--  5. RPC
-- ---------------------------------------------------------------------
create or replace function public.stage_catalog_import(
  p_organization_id uuid,
  p_file_name       text,
  p_rows            jsonb
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_batch uuid;
begin
  if not (p_organization_id = any (platform.current_org_ids()))
     or not platform.has_permission(p_organization_id, 'catalog.manage') then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : vous n''avez pas le droit d''importer le catalogue.');
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'Le fichier ne contient aucune ligne.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_rows) > 5000 then
    raise exception 'Fichier trop volumineux (5000 lignes au plus).' using errcode = '22023';
  end if;

  insert into public.import_batches (organization_id, kind, file_name, created_by)
  values (p_organization_id, 'catalog', coalesce(nullif(trim(p_file_name), ''), 'import'), auth.uid())
  returning id into v_batch;

  insert into public.import_rows (organization_id, batch_id, row_number, source, data)
  select p_organization_id, v_batch, e.ordinality::integer, e.value ->> 'source', e.value - 'source'
    from jsonb_array_elements(p_rows) with ordinality e;

  perform gescatering_internal.validate_catalog_batch(v_batch);
  return v_batch;
end $$;

create or replace function public.confirm_catalog_import(p_batch_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_batch  public.import_batches;
  r        public.import_rows;
  v_cat    uuid;
  v_su     uuid;
  v_pu     uuid;
  v_prod   uuid;
  v_fact   numeric;
  v_cats   integer := 0;
  v_prods  integer := 0;
  v_convs  integer := 0;
  v_result jsonb;
begin
  select * into v_batch from public.import_batches where id = p_batch_id for update;
  if v_batch.id is null or not (v_batch.organization_id = any (platform.current_org_ids())) then
    raise exception 'Import introuvable.' using errcode = 'P0002';
  end if;
  if not platform.has_permission(v_batch.organization_id, 'catalog.manage') then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : vous n''avez pas le droit d''importer le catalogue.');
  end if;
  if v_batch.status <> 'preview' then
    raise exception 'Cet import a d\xE9j\xE0 \xE9t\xE9 %.',
      case v_batch.status when 'confirmed' then 'confirm\xE9' else 'annul\xE9' end
      using errcode = '22023';
  end if;

  -- Le catalogue a pu changer depuis la pr\xE9visualisation : on recontr\xF4le.
  perform gescatering_internal.validate_catalog_batch(p_batch_id);
  select * into v_batch from public.import_batches where id = p_batch_id;
  if v_batch.error_count > 0 then
    raise exception 'Import impossible : % ligne(s) en erreur. Corriger le fichier puis recommencer.',
      v_batch.error_count using errcode = '22023';
  end if;

  for r in select * from public.import_rows where batch_id = p_batch_id order by row_number loop
    select id into v_cat from public.product_categories
     where organization_id = v_batch.organization_id
       and lower(trim(name)) = lower(trim(r.data ->> 'category'));
    if v_cat is null then
      insert into public.product_categories (organization_id, name, kind)
      values (v_batch.organization_id, trim(r.data ->> 'category'),
              coalesce(nullif(r.data ->> 'category_kind', ''), 'other'))
      returning id into v_cat;
      v_cats := v_cats + 1;
    end if;

    v_su := gescatering_internal.unit_id(v_batch.organization_id, r.data ->> 'stock_unit');
    v_pu := gescatering_internal.unit_id(v_batch.organization_id, nullif(trim(r.data ->> 'purchase_unit'), ''));

    insert into public.products (organization_id, reference, name, category_id,
                                 stock_unit_id, purchase_unit_id)
    values (v_batch.organization_id, trim(r.data ->> 'reference'),
            regexp_replace(trim(r.data ->> 'name'), '\\s+', ' ', 'g'),
            v_cat, v_su, v_pu)
    returning id into v_prod;
    v_prods := v_prods + 1;

    v_fact := nullif(trim(r.data ->> 'package_factor'), '')::numeric;
    if v_fact is not null and v_pu is not null and v_pu <> v_su
       and (select dimension from public.units where id = v_pu) = 'package' then
      insert into public.product_unit_conversions
        (organization_id, product_id, unit_id, factor, is_validated)
      values (v_batch.organization_id, v_prod, v_pu, v_fact, false);
      v_convs := v_convs + 1;
    end if;

    update public.import_rows set created_product_id = v_prod where id = r.id;
  end loop;

  v_result := jsonb_build_object('categories_created', v_cats,
                                 'products_created', v_prods,
                                 'conversions_to_validate', v_convs);
  update public.import_batches
     set status = 'confirmed', confirmed_by = auth.uid(), confirmed_at = now(),
         result = v_result
   where id = p_batch_id;
  return v_result;
end $$;

create or replace function public.cancel_catalog_import(p_batch_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_batch public.import_batches;
begin
  select * into v_batch from public.import_batches where id = p_batch_id for update;
  if v_batch.id is null or not (v_batch.organization_id = any (platform.current_org_ids())) then
    raise exception 'Import introuvable.' using errcode = 'P0002';
  end if;
  if not platform.has_permission(v_batch.organization_id, 'catalog.manage') then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e.');
  end if;
  if v_batch.status <> 'preview' then
    raise exception 'Seul un import en pr\xE9visualisation peut \xEAtre abandonn\xE9.' using errcode = '22023';
  end if;
  update public.import_batches set status = 'cancelled' where id = p_batch_id;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.stage_catalog_import(uuid, text, jsonb)',
    'public.confirm_catalog_import(uuid)',
    'public.cancel_catalog_import(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
`},{name:"migrations/C0006__internal_requests.sql",sql:`-- =====================================================================\r
--  C0006 \u2014 Demandes internes des services\r
--\r
--  Cycle de vie (statut modifiable UNIQUEMENT par les RPC) :\r
--\r
--   draft \u2500\u2500submit\u2500\u2500\u25BA submitted \u2500\u2500approve\u2500\u2500\u25BA approved \u2500\u2500serve\u2500\u2500\u25BA partially_served \u2500\u2500\u25BA served\r
--     \u2502                  \u2502 refus \u2192 rejected      \u2502\r
--     \u2514\u2500\u2500\u2500\u2500\u2500\u2500cancel\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\u2500\u2500\u25BA cancelled\r
--\r
--  \u26A0\uFE0F CR\xC9\xC9E \u2260 SOUMISE \u2260 VALID\xC9E. Une demande n'engage le stock qu'une fois\r
--     VALID\xC9E par la direction d'exploitation (\`request.approve\`) \u2014 ou\r
--     d'office si l'organisation a d\xE9sactiv\xE9 ce circuit\r
--     (\`catering_settings.request_approval_required = false\`).\r
--\r
--  \xC0 la validation, chaque ligne r\xE9serve son stock (une r\xE9servation par\r
--  ligne, source 'request_line'). L'ordre de validation fait foi : la\r
--  premi\xE8re demande valid\xE9e est la premi\xE8re servie.\r
--\r
--  Consolidation : \`v_request_consolidation\` regroupe les lignes valid\xE9es\r
--  PAR IDENTIFIANT PRODUIT. Chaque demande garde son identit\xE9 et son\r
--  statut ; le total ne compte jamais deux fois la m\xEAme ligne.\r
--\r
--  Cloisonnement : un demandeur peut \xEAtre limit\xE9 \xE0 son service via\r
--  \`membership_scopes\` (scope_type = 'department').\r
-- =====================================================================\r
\r
-- ---------------------------------------------------------------------\r
--  1. DEMANDES\r
-- ---------------------------------------------------------------------\r
create table if not exists public.requests (\r
  id               uuid primary key default gen_random_uuid(),\r
  organization_id  uuid not null references platform.organizations(id) on delete cascade,\r
  reference        text,\r
  department_id    uuid not null,              -- service demandeur\r
  site_id          uuid not null,              -- magasin qui sert la demande\r
  status           text not null default 'draft' check (status in (\r
                     'draft', 'submitted', 'approved', 'rejected',\r
                     'partially_served', 'served', 'cancelled')),\r
  needed_on        date not null default (current_date + 1),\r
  needed_slot      text check (needed_slot in ('morning', 'noon', 'evening')),\r
  urgency          text not null default 'normal'\r
                     check (urgency in ('normal', 'urgent', 'critical')),\r
  comment          text,\r
  photo_url        text,\r
  voice_note_url   text,\r
  created_by       uuid references auth.users(id) on delete set null default auth.uid(),\r
  created_at       timestamptz not null default now(),\r
  updated_at       timestamptz not null default now(),\r
  submitted_at     timestamptz,\r
  approved_by      uuid references auth.users(id) on delete set null,\r
  approved_at      timestamptz,\r
  approval_mode    text check (approval_mode in ('manual', 'auto')),\r
  decision_comment text,                        -- motif de refus ou d'ajustement\r
  cancelled_by     uuid references auth.users(id) on delete set null,\r
  cancelled_at     timestamptz,\r
  cancel_reason    text,\r
  served_at        timestamptz,\r
  copied_from_id   uuid references public.requests(id),\r
  constraint uq_requests_id_org unique (id, organization_id),\r
  constraint uq_requests_reference unique (organization_id, reference),\r
  constraint fk_requests_department foreign key (department_id, organization_id)\r
    references public.departments (id, organization_id),\r
  constraint fk_requests_site foreign key (site_id, organization_id)\r
    references public.sites (id, organization_id)\r
);\r
create index if not exists idx_requests_status on public.requests (organization_id, status, needed_on);\r
create index if not exists idx_requests_department on public.requests (department_id, created_at desc);\r
\r
create table if not exists public.request_lines (\r
  id                uuid primary key default gen_random_uuid(),\r
  organization_id   uuid not null references platform.organizations(id) on delete cascade,\r
  request_id        uuid not null,\r
  product_id        uuid not null,\r
  unit_id           uuid references public.units(id),     -- unit\xE9 saisie (null = unit\xE9 de stock)\r
  quantity          numeric(14,3) not null check (quantity > 0),\r
  note              text,\r
  -- Calcul\xE9s par la base, jamais saisis par le client :\r
  quantity_stock    numeric(14,3) not null default 0,     -- demand\xE9, en unit\xE9 de stock\r
  approved_quantity numeric(14,3),                        -- accord\xE9 (null avant validation)\r
  reservation_id    uuid references public.stock_reservations(id),\r
  created_at        timestamptz not null default now(),\r
  updated_at        timestamptz not null default now(),\r
  constraint uq_request_lines_id_org unique (id, organization_id),\r
  constraint uq_request_line_product unique (request_id, product_id),\r
  constraint ck_request_line_approved check (\r
    approved_quantity is null or (approved_quantity >= 0 and approved_quantity <= quantity_stock)),\r
  constraint fk_rql_request foreign key (request_id, organization_id)\r
    references public.requests (id, organization_id) on delete cascade,\r
  constraint fk_rql_product foreign key (product_id, organization_id)\r
    references public.products (id, organization_id)\r
);\r
create index if not exists idx_request_lines_product on public.request_lines (product_id);\r
\r
-- Conversion en unit\xE9 de stock d\xE8s la saisie : une unit\xE9 inconnue est\r
-- refus\xE9e au moment o\xF9 le demandeur la choisit, pas \xE0 la validation.\r
create or replace function gescatering_internal.compute_request_line()\r
returns trigger\r
language plpgsql\r
security definer\r
set search_path = ''\r
as $$\r
begin\r
  if not exists (select 1 from public.products\r
                  where id = new.product_id and organization_id = new.organization_id and is_active) then\r
    raise exception 'Ce produit n''est pas disponible \xE0 la demande.' using errcode = '22023';\r
  end if;\r
  new.quantity_stock := public.convert_to_stock_unit(new.product_id, new.unit_id, new.quantity);\r
  if tg_op = 'INSERT' then\r
    new.approved_quantity := null;\r
    new.reservation_id := null;\r
  end if;\r
  return new;\r
end $$;\r
\r
drop trigger if exists trg_request_line_compute on public.request_lines;\r
create trigger trg_request_line_compute\r
  before insert or update of product_id, unit_id, quantity on public.request_lines\r
  for each row execute function gescatering_internal.compute_request_line();\r
\r
-- R\xE9f\xE9rence DM-<ann\xE9e>-0001 attribu\xE9e par la base.\r
create or replace function gescatering_internal.assign_request_reference()\r
returns trigger\r
language plpgsql\r
security definer\r
set search_path = ''\r
as $$\r
begin\r
  new.reference := gescatering_internal.next_reference(new.organization_id, 'request', 'DM');\r
  return new;\r
end $$;\r
\r
drop trigger if exists trg_request_reference on public.requests;\r
create trigger trg_request_reference before insert on public.requests\r
  for each row execute function gescatering_internal.assign_request_reference();\r
\r
do $$\r
declare t text;\r
begin\r
  foreach t in array array['requests', 'request_lines'] loop\r
    perform platform.attach_updated_at('public', t);\r
    perform platform.attach_org_immutability('public', t);\r
    perform platform.attach_org_default('public', t);\r
  end loop;\r
end $$;\r
-- Cr\xE9ation, validation, modification, annulation : trac\xE9es (CDC \xA717).\r
select platform.attach_audit('public', 'requests');\r
select platform.attach_audit('public', 'request_lines');\r
\r
-- ---------------------------------------------------------------------\r
--  2. RLS\r
-- ---------------------------------------------------------------------\r
alter table public.requests      enable row level security;\r
alter table public.request_lines enable row level security;\r
\r
revoke all on public.requests, public.request_lines from anon, authenticated;\r
grant select on public.requests, public.request_lines to authenticated;\r
-- Le client saisit le CONTENU du brouillon, jamais statut ni validation.\r
grant insert (organization_id, department_id, site_id, needed_on, needed_slot, urgency,\r
              comment, photo_url, voice_note_url)\r
  on public.requests to authenticated;\r
grant update (department_id, site_id, needed_on, needed_slot, urgency,\r
              comment, photo_url, voice_note_url)\r
  on public.requests to authenticated;\r
grant insert (organization_id, request_id, product_id, unit_id, quantity, note)\r
  on public.request_lines to authenticated;\r
grant update (product_id, unit_id, quantity, note) on public.request_lines to authenticated;\r
grant delete on public.request_lines to authenticated;\r
\r
-- Peut-on agir pour ce service ?\r
create or replace function gescatering_internal.can_request_for(p_org uuid, p_department_id uuid)\r
returns boolean\r
language sql\r
stable\r
security definer\r
set search_path = ''\r
as $$\r
  select platform.has_permission(p_org, 'request.create')\r
     and platform.in_scope(p_org, 'department', p_department_id);\r
$$;\r
\r
-- Lecture d'une demande : la direction et le magasin voient tout ; un\r
-- demandeur voit celles de son (ses) service(s).\r
create or replace function gescatering_internal.can_read_request(p_org uuid, p_department_id uuid)\r
returns boolean\r
language sql\r
stable\r
security definer\r
set search_path = ''\r
as $$\r
  select platform.has_permission(p_org, 'request.read_all')\r
      or gescatering_internal.can_request_for(p_org, p_department_id);\r
$$;\r
\r
create or replace function gescatering_internal.request_is_editable_draft(p_request_id uuid)\r
returns boolean\r
language sql\r
stable\r
security definer\r
set search_path = ''\r
as $$\r
  select exists (\r
    select 1 from public.requests r\r
     where r.id = p_request_id and r.status = 'draft'\r
       and gescatering_internal.can_request_for(r.organization_id, r.department_id));\r
$$;\r
\r
grant execute on function gescatering_internal.can_request_for(uuid, uuid) to authenticated;\r
grant execute on function gescatering_internal.can_read_request(uuid, uuid) to authenticated;\r
grant execute on function gescatering_internal.request_is_editable_draft(uuid) to authenticated;\r
\r
drop policy if exists requests_select on public.requests;\r
create policy requests_select on public.requests\r
  for select to authenticated\r
  using (gescatering_internal.can_read_request(organization_id, department_id));\r
\r
drop policy if exists requests_insert on public.requests;\r
create policy requests_insert on public.requests\r
  for insert to authenticated\r
  with check (status = 'draft'\r
              and gescatering_internal.can_request_for(organization_id, department_id));\r
\r
drop policy if exists requests_update on public.requests;\r
create policy requests_update on public.requests\r
  for update to authenticated\r
  using      (status = 'draft' and gescatering_internal.can_request_for(organization_id, department_id))\r
  with check (status = 'draft' and gescatering_internal.can_request_for(organization_id, department_id));\r
\r
drop policy if exists request_lines_select on public.request_lines;\r
create policy request_lines_select on public.request_lines\r
  for select to authenticated\r
  using (exists (select 1 from public.requests r where r.id = request_id));  -- h\xE9rite de la demande\r
\r
drop policy if exists request_lines_insert on public.request_lines;\r
create policy request_lines_insert on public.request_lines\r
  for insert to authenticated\r
  with check (gescatering_internal.request_is_editable_draft(request_id));\r
\r
drop policy if exists request_lines_update on public.request_lines;\r
create policy request_lines_update on public.request_lines\r
  for update to authenticated\r
  using      (gescatering_internal.request_is_editable_draft(request_id))\r
  with check (gescatering_internal.request_is_editable_draft(request_id));\r
\r
drop policy if exists request_lines_delete on public.request_lines;\r
create policy request_lines_delete on public.request_lines\r
  for delete to authenticated\r
  using (gescatering_internal.request_is_editable_draft(request_id));\r
\r
-- =====================================================================\r
--  3. RPC DU CYCLE DE VIE\r
-- =====================================================================\r
\r
create or replace function gescatering_internal.lock_request(p_request_id uuid)\r
returns public.requests\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req public.requests;\r
begin\r
  select * into v_req from public.requests where id = p_request_id for update;\r
  if v_req.id is null\r
     or not (v_req.organization_id = any (platform.current_org_ids()))\r
     or not gescatering_internal.can_read_request(v_req.organization_id, v_req.department_id) then\r
    raise exception 'Demande introuvable.' using errcode = 'P0002';\r
  end if;\r
  return v_req;\r
end $$;\r
\r
-- R\xE9serve (ou compl\xE8te) le stock de toutes les lignes accord\xE9es et non\r
-- encore servies. Renvoie, par ligne : accord\xE9, r\xE9serv\xE9, sorti, manque.\r
create or replace function gescatering_internal.reserve_request_lines(p_request_id uuid)\r
returns jsonb\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req   public.requests;\r
  l       public.request_lines;\r
  v_res   public.stock_reservations;\r
  v_out   jsonb := '[]'::jsonb;\r
begin\r
  select * into v_req from public.requests where id = p_request_id;\r
  for l in select * from public.request_lines where request_id = p_request_id order by created_at loop\r
    v_res := null;\r
    if coalesce(l.approved_quantity, 0) > 0 then\r
      v_res := gescatering_internal.reserve_core(\r
        v_req.organization_id, v_req.site_id, l.product_id, l.approved_quantity,\r
        'request_line', l.id, v_req.needed_on);\r
      if l.reservation_id is distinct from v_res.id then\r
        update public.request_lines set reservation_id = v_res.id where id = l.id;\r
      end if;\r
    end if;\r
    v_out := v_out || jsonb_build_object(\r
      'line_id', l.id, 'product_id', l.product_id,\r
      'approved', coalesce(l.approved_quantity, 0),\r
      'reserved', coalesce(v_res.reserved_quantity, 0),\r
      'issued',   coalesce(v_res.issued_quantity, 0),\r
      'shortage', coalesce(v_res.requested_quantity - v_res.reserved_quantity - v_res.issued_quantity, 0));\r
  end loop;\r
  return v_out;\r
end $$;\r
\r
-- Validation (interne) : accorde les quantit\xE9s, puis r\xE9serve.\r
create or replace function gescatering_internal.approve_request_core(\r
  p_request_id  uuid,\r
  p_mode        text,\r
  p_adjustments jsonb,\r
  p_comment     text\r
)\r
returns jsonb\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_item    jsonb;\r
  v_line    public.request_lines;\r
  v_qty     numeric;\r
  v_reduced boolean := false;\r
begin\r
  update public.request_lines set approved_quantity = quantity_stock where request_id = p_request_id;\r
\r
  for v_item in select * from jsonb_array_elements(coalesce(p_adjustments, '[]'::jsonb)) loop\r
    select * into v_line from public.request_lines\r
     where id = (v_item ->> 'line_id')::uuid and request_id = p_request_id;\r
    if v_line.id is null then\r
      raise exception 'Ligne de demande introuvable.' using errcode = 'P0002';\r
    end if;\r
    v_qty := (v_item ->> 'quantity')::numeric;\r
    if v_qty is null or v_qty < 0 or v_qty > v_line.quantity_stock then\r
      raise exception 'La quantit\xE9 accord\xE9e doit \xEAtre comprise entre 0 et la quantit\xE9 demand\xE9e.'\r
        using errcode = '22023';\r
    end if;\r
    if v_qty < v_line.quantity_stock then v_reduced := true; end if;\r
    update public.request_lines set approved_quantity = v_qty where id = v_line.id;\r
  end loop;\r
\r
  if v_reduced and coalesce(trim(p_comment), '') = '' then\r
    raise exception 'Indiquer pourquoi la quantit\xE9 est r\xE9duite.' using errcode = '22023';\r
  end if;\r
  if not exists (select 1 from public.request_lines\r
                  where request_id = p_request_id and approved_quantity > 0) then\r
    raise exception 'Rien n''est accord\xE9 : refuser la demande plut\xF4t que la valider \xE0 z\xE9ro.'\r
      using errcode = '22023';\r
  end if;\r
\r
  update public.requests\r
     set status = 'approved', approved_at = now(), approval_mode = p_mode,\r
         approved_by = case when p_mode = 'manual' then auth.uid() end,\r
         decision_comment = nullif(trim(p_comment), '')\r
   where id = p_request_id;\r
\r
  return gescatering_internal.reserve_request_lines(p_request_id);\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Soumission. Renvoie le nouveau statut ('submitted' ou 'approved').\r
-- ---------------------------------------------------------------------\r
create or replace function public.submit_request(p_request_id uuid)\r
returns text\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req      public.requests;\r
  v_required boolean;\r
begin\r
  v_req := gescatering_internal.lock_request(p_request_id);\r
  if not gescatering_internal.can_request_for(v_req.organization_id, v_req.department_id) then\r
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : vous ne pouvez pas faire de demande pour ce service.');\r
  end if;\r
  if v_req.status <> 'draft' then\r
    raise exception 'Cette demande a d\xE9j\xE0 \xE9t\xE9 envoy\xE9e.' using errcode = '22023';\r
  end if;\r
  if not exists (select 1 from public.request_lines where request_id = p_request_id) then\r
    raise exception 'La demande est vide : ajouter au moins un produit.' using errcode = '22023';\r
  end if;\r
  if v_req.needed_on < current_date then\r
    raise exception 'La date de besoin est d\xE9j\xE0 pass\xE9e.' using errcode = '22023';\r
  end if;\r
\r
  update public.requests set status = 'submitted', submitted_at = now() where id = p_request_id;\r
\r
  select request_approval_required into v_required\r
    from public.catering_settings where organization_id = v_req.organization_id;\r
  if v_required is false then\r
    perform gescatering_internal.approve_request_core(p_request_id, 'auto', null, null);\r
    return 'approved';\r
  end if;\r
  return 'submitted';\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Validation ou refus par la direction d'exploitation.\r
--  p_adjustments : [{"line_id": "...", "quantity": 20}]  (unit\xE9 de stock)\r
--  Renvoie, par ligne : accord\xE9, r\xE9serv\xE9, manque.\r
-- ---------------------------------------------------------------------\r
create or replace function public.approve_request(\r
  p_request_id  uuid,\r
  p_approve     boolean,\r
  p_comment     text  default null,\r
  p_adjustments jsonb default null\r
)\r
returns jsonb\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req public.requests;\r
begin\r
  v_req := gescatering_internal.lock_request(p_request_id);\r
  if not platform.has_permission(v_req.organization_id, 'request.approve') then\r
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : la validation revient \xE0 la Production.');\r
  end if;\r
  if v_req.status <> 'submitted' then\r
    raise exception 'Cette demande n''est pas en attente de validation.' using errcode = '22023';\r
  end if;\r
  if v_req.created_by = auth.uid()\r
     and not platform.has_permission(v_req.organization_id, 'organization.manage') then\r
    perform gescatering_internal.deny('Vous ne pouvez pas valider votre propre demande.');\r
  end if;\r
\r
  if not p_approve then\r
    if coalesce(trim(p_comment), '') = '' then\r
      raise exception 'Indiquer le motif du refus.' using errcode = '22023';\r
    end if;\r
    update public.requests\r
       set status = 'rejected', decision_comment = p_comment,\r
           approved_by = auth.uid(), approved_at = now(), approval_mode = 'manual'\r
     where id = p_request_id;\r
    return '[]'::jsonb;\r
  end if;\r
\r
  return gescatering_internal.approve_request_core(p_request_id, 'manual', p_adjustments, p_comment);\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Nouvelle tentative de r\xE9servation (apr\xE8s une livraison, par exemple).\r
-- ---------------------------------------------------------------------\r
create or replace function public.reserve_request(p_request_id uuid)\r
returns jsonb\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req public.requests;\r
begin\r
  v_req := gescatering_internal.lock_request(p_request_id);\r
  perform gescatering_internal.authorize_site(v_req.site_id, 'stock.reserve');\r
  if v_req.status not in ('approved', 'partially_served') then\r
    raise exception 'Seule une demande valid\xE9e r\xE9serve du stock.' using errcode = '22023';\r
  end if;\r
  return gescatering_internal.reserve_request_lines(p_request_id);\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Service de la demande par le magasin (total ou partiel).\r
--  p_lines : [{"line_id": "...", "quantity": 10}]  (unit\xE9 de stock)\r
-- ---------------------------------------------------------------------\r
create or replace function public.serve_request(\r
  p_request_id      uuid,\r
  p_lines           jsonb,\r
  p_idempotency_key text\r
)\r
returns text\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req    public.requests;\r
  v_item   jsonb;\r
  v_line   public.request_lines;\r
  v_qty    numeric;\r
  v_status text;\r
begin\r
  if coalesce(trim(p_idempotency_key), '') = '' then\r
    raise exception 'Cl\xE9 d''idempotence obligatoire.' using errcode = '22023';\r
  end if;\r
  v_req := gescatering_internal.lock_request(p_request_id);\r
  perform gescatering_internal.authorize_site(v_req.site_id, 'stock.move');\r
\r
  -- Envoi d\xE9j\xE0 trait\xE9 (double clic, r\xE9seau) : rien ne bouge.\r
  if exists (select 1 from public.stock_movements m\r
               join public.request_lines l on m.idempotency_key = p_idempotency_key || ':' || l.id::text\r
              where m.organization_id = v_req.organization_id\r
                and l.request_id = p_request_id) then\r
    return v_req.status;\r
  end if;\r
\r
  if v_req.status not in ('approved', 'partially_served') then\r
    raise exception 'Seule une demande valid\xE9e peut \xEAtre servie.' using errcode = '22023';\r
  end if;\r
\r
  for v_item in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) loop\r
    select * into v_line from public.request_lines\r
     where id = (v_item ->> 'line_id')::uuid and request_id = p_request_id;\r
    if v_line.id is null then\r
      raise exception 'Ligne de demande introuvable.' using errcode = 'P0002';\r
    end if;\r
    v_qty := (v_item ->> 'quantity')::numeric;\r
    continue when coalesce(v_qty, 0) = 0;\r
    if v_line.reservation_id is null then\r
      raise exception 'Aucun stock r\xE9serv\xE9 pour cette ligne : relancer la r\xE9servation.' using errcode = '22023';\r
    end if;\r
    perform public.issue_reserved_stock(v_line.reservation_id, v_qty,\r
                                        p_idempotency_key || ':' || v_line.id::text);\r
  end loop;\r
\r
  select case when bool_and(coalesce(r.issued_quantity, 0) >= l.approved_quantity) then 'served'\r
              else 'partially_served' end\r
    into v_status\r
    from public.request_lines l\r
    left join public.stock_reservations r on r.id = l.reservation_id\r
   where l.request_id = p_request_id and l.approved_quantity > 0;\r
\r
  update public.requests\r
     set status = v_status,\r
         served_at = case when v_status = 'served' then now() end\r
   where id = p_request_id;\r
  return v_status;\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Annulation. Le demandeur annule tant que rien n'est valid\xE9 ; ensuite,\r
--  la direction ou le magasin, tant que rien n'est sorti. Les r\xE9servations\r
--  sont lib\xE9r\xE9es dans la m\xEAme transaction.\r
-- ---------------------------------------------------------------------\r
create or replace function public.cancel_request(p_request_id uuid, p_reason text)\r
returns void\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req public.requests;\r
  v_res uuid;\r
begin\r
  v_req := gescatering_internal.lock_request(p_request_id);\r
  if coalesce(trim(p_reason), '') = '' then\r
    raise exception 'Le motif est obligatoire.' using errcode = '22023';\r
  end if;\r
\r
  if v_req.status in ('draft', 'submitted') then\r
    if not gescatering_internal.can_request_for(v_req.organization_id, v_req.department_id)\r
       and not platform.has_permission(v_req.organization_id, 'request.approve') then\r
      perform gescatering_internal.deny('Op\xE9ration refus\xE9e.');\r
    end if;\r
  elsif v_req.status = 'approved' then\r
    if not platform.has_permission(v_req.organization_id, 'request.approve')\r
       and not platform.has_permission(v_req.organization_id, 'stock.reserve') then\r
      perform gescatering_internal.deny('Une demande valid\xE9e ne peut \xEAtre annul\xE9e que par la Production ou le Stock.');\r
    end if;\r
    if exists (select 1 from public.request_lines l\r
                 join public.stock_reservations r on r.id = l.reservation_id\r
                where l.request_id = p_request_id and r.issued_quantity > 0) then\r
      raise exception 'Des produits ont d\xE9j\xE0 \xE9t\xE9 sortis : la demande ne peut plus \xEAtre annul\xE9e.' using errcode = '22023';\r
    end if;\r
    for v_res in\r
      select r.id from public.request_lines l\r
        join public.stock_reservations r on r.id = l.reservation_id\r
       where l.request_id = p_request_id and r.status = 'active'\r
    loop\r
      perform gescatering_internal.release_core(v_res, 'Demande annul\xE9e : ' || p_reason);\r
    end loop;\r
  else\r
    raise exception 'Cette demande ne peut plus \xEAtre annul\xE9e.' using errcode = '22023';\r
  end if;\r
\r
  update public.requests\r
     set status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now(), cancel_reason = p_reason\r
   where id = p_request_id;\r
end $$;\r
\r
-- ---------------------------------------------------------------------\r
--  Refaire une demande (favoris, demandes r\xE9currentes) : copie en brouillon.\r
-- ---------------------------------------------------------------------\r
create or replace function public.copy_request(p_request_id uuid, p_needed_on date default null)\r
returns uuid\r
language plpgsql\r
volatile\r
security definer\r
set search_path = ''\r
as $$\r
declare\r
  v_req public.requests;\r
  v_new uuid;\r
begin\r
  v_req := gescatering_internal.lock_request(p_request_id);\r
  if not gescatering_internal.can_request_for(v_req.organization_id, v_req.department_id) then\r
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : vous ne pouvez pas faire de demande pour ce service.');\r
  end if;\r
\r
  insert into public.requests (organization_id, department_id, site_id, needed_on, needed_slot,\r
                               urgency, comment, created_by, copied_from_id)\r
  values (v_req.organization_id, v_req.department_id, v_req.site_id,\r
          coalesce(p_needed_on, current_date + 1), v_req.needed_slot, 'normal',\r
          v_req.comment, auth.uid(), v_req.id)\r
  returning id into v_new;\r
\r
  insert into public.request_lines (organization_id, request_id, product_id, unit_id, quantity, note)\r
  select l.organization_id, v_new, l.product_id, l.unit_id, l.quantity, l.note\r
    from public.request_lines l\r
    join public.products p on p.id = l.product_id and p.is_active\r
   where l.request_id = p_request_id;\r
  return v_new;\r
end $$;\r
\r
-- =====================================================================\r
--  4. VUES\r
-- =====================================================================\r
\r
-- Avancement d'une ligne (r\xE9serv\xE9, sorti). Un demandeur n'a pas acc\xE8s aux\r
-- r\xE9servations (RLS du stock) : sans cette fonction, la vue lui calculerait\r
-- un faux manque. Elle ne r\xE9pond qu'\xE0 qui peut lire la demande.\r
create or replace function gescatering_internal.line_progress(p_line_id uuid)\r
returns table (reserved numeric, issued numeric)\r
language sql\r
stable\r
security definer\r
set search_path = ''\r
as $$\r
  select coalesce(s.reserved_quantity, 0), coalesce(s.issued_quantity, 0)\r
    from public.request_lines l\r
    join public.requests r on r.id = l.request_id\r
    left join public.stock_reservations s on s.id = l.reservation_id\r
   where l.id = p_line_id\r
     and r.organization_id = any (platform.current_org_ids())\r
     and gescatering_internal.can_read_request(r.organization_id, r.department_id);\r
$$;\r
grant execute on function gescatering_internal.line_progress(uuid) to authenticated;\r
\r
-- Une ligne par produit demand\xE9, avec son avancement.\r
create or replace view public.v_request_lines\r
with (security_invoker = true)\r
as\r
select\r
  l.id                     as line_id,\r
  r.organization_id,\r
  r.id                     as request_id,\r
  r.reference,\r
  r.status                 as request_status,\r
  r.department_id,\r
  d.name                   as department_name,\r
  r.site_id,\r
  r.needed_on,\r
  r.needed_slot,\r
  r.urgency,\r
  l.product_id,\r
  p.name                   as product_name,\r
  u.code                   as unit_code,\r
  l.quantity_stock         as requested,\r
  l.approved_quantity      as approved,\r
  coalesce(s.reserved, 0)  as reserved,\r
  coalesce(s.issued, 0)    as issued,\r
  case when r.status in ('approved', 'partially_served')\r
       then greatest(coalesce(l.approved_quantity, 0) - coalesce(s.reserved, 0)\r
                     - coalesce(s.issued, 0), 0)\r
       else 0 end          as shortage\r
from public.request_lines l\r
join public.requests r      on r.id = l.request_id\r
join public.departments d   on d.id = r.department_id\r
join public.products p      on p.id = l.product_id\r
join public.units u         on u.id = p.stock_unit_id\r
left join lateral gescatering_internal.line_progress(l.id) s on true;\r
\r
-- Consolidation du magasin : besoins VALID\xC9S restant \xE0 servir, regroup\xE9s\r
-- par site \xD7 produit (identifiant unique, jamais par nom).\r
create or replace view public.v_request_consolidation\r
with (security_invoker = true)\r
as\r
select\r
  organization_id,\r
  site_id,\r
  product_id,\r
  product_name,\r
  unit_code,\r
  sum(approved - issued)                        as to_serve,\r
  sum(reserved)                                 as reserved,\r
  sum(shortage)                                 as shortage,\r
  count(distinct request_id)                    as request_count,\r
  min(needed_on)                                as first_needed_on,\r
  bool_or(urgency <> 'normal')                  as has_urgent,\r
  array_agg(reference order by needed_on, reference) as request_references\r
from public.v_request_lines\r
where request_status in ('approved', 'partially_served')\r
  and approved > issued\r
group by organization_id, site_id, product_id, product_name, unit_code;\r
\r
revoke all on public.v_request_lines, public.v_request_consolidation from anon;\r
grant select on public.v_request_lines, public.v_request_consolidation to authenticated;\r
\r
-- ---------------------------------------------------------------------\r
--  5. EXPOSITION\r
-- ---------------------------------------------------------------------\r
do $$\r
declare f text;\r
begin\r
  foreach f in array array[\r
    'public.submit_request(uuid)',\r
    'public.approve_request(uuid, boolean, text, jsonb)',\r
    'public.reserve_request(uuid)',\r
    'public.serve_request(uuid, jsonb, text)',\r
    'public.cancel_request(uuid, text)',\r
    'public.copy_request(uuid, date)'\r
  ] loop\r
    execute format('revoke all on function %s from public, anon', f);\r
    execute format('grant execute on function %s to authenticated', f);\r
  end loop;\r
end $$;\r
`},{name:"migrations/C0007__supply_needs.sql",sql:`-- =====================================================================
--  C0007 \u2014 Calcul des besoins et transmission aux achats
--
--  LE CALCUL (vue v_supply_needs, par site \xD7 produit) :
--
--    manque r\xE9serv\xE9   = \u03A3 (demand\xE9 \u2212 r\xE9serv\xE9 \u2212 sorti) des r\xE9servations actives
--                       (demandes valid\xE9es aujourd'hui ; production et
--                        prestations demain, par le m\xEAme m\xE9canisme)
--    \xE9cart au seuil   = max(seuil minimal \u2212 disponible, 0)
--    besoin brut      = manque r\xE9serv\xE9 + \xE9cart au seuil
--
--    d\xE9j\xE0 couvert     = transmis aux achats et pas encore en commande
--                     + en commande (brouillon, \xE0 valider, valid\xE9e)
--                     + command\xE9 et attendu (pass\xE9 au fournisseur, non re\xE7u)
--
--    \xC0 COMMANDER      = max(besoin brut \u2212 d\xE9j\xE0 couvert, 0)
--
--  Chaque quantit\xE9 n'est compt\xE9e QU'\xC0 UN ENDROIT : une ligne de besoin
--  transmise sort du \xAB transmis \xBB d\xE8s qu'elle entre dans une commande, o\xF9
--  elle est alors compt\xE9e. Pas de double comptage.
--
--  Le stock attendu n'est JAMAIS du stock physique : il r\xE9duit la quantit\xE9 \xE0
--  commander, mais la vue signale quand il arrive APR\xC8S la date du besoin.
--
--  \u26A0\uFE0F Rien ne se commande seul. Le magasin TRANSMET un besoin ; les achats
--     en font un BROUILLON de commande ; la suite suit le circuit de C0004.
-- =====================================================================

-- ---------------------------------------------------------------------
--  1. BESOINS TRANSMIS AUX ACHATS
-- ---------------------------------------------------------------------
create table if not exists public.supply_requests (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  reference       text,
  site_id         uuid not null,
  note            text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  constraint uq_supply_requests_id_org unique (id, organization_id),
  constraint uq_supply_requests_reference unique (organization_id, reference),
  constraint fk_sr_site foreign key (site_id, organization_id)
    references public.sites (id, organization_id)
);

create table if not exists public.supply_request_lines (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references platform.organizations(id) on delete cascade,
  supply_request_id uuid not null,
  site_id           uuid not null,
  product_id        uuid not null,
  quantity          numeric(14,3) not null check (quantity > 0),   -- unit\xE9 de stock
  calculated_need   numeric(14,3) not null,                        -- \xAB \xE0 commander \xBB au moment de l'envoi
  needed_by         date,
  extra_reason      text,                -- obligatoire si quantit\xE9 > besoin calcul\xE9
  -- open : re\xE7u par les achats, \xE0 traiter
  -- in_purchase : int\xE9gr\xE9 \xE0 une commande (compt\xE9e alors dans la commande)
  -- cancelled : abandonn\xE9, avec motif
  status            text not null default 'open'
                      check (status in ('open', 'in_purchase', 'cancelled')),
  purchase_order_id uuid,
  cancel_reason     text,
  updated_at        timestamptz not null default now(),
  constraint uq_supply_lines_id_org unique (id, organization_id),
  constraint fk_srl_request foreign key (supply_request_id, organization_id)
    references public.supply_requests (id, organization_id),
  constraint fk_srl_site foreign key (site_id, organization_id)
    references public.sites (id, organization_id),
  constraint fk_srl_product foreign key (product_id, organization_id)
    references public.products (id, organization_id),
  constraint fk_srl_po foreign key (purchase_order_id, organization_id)
    references public.purchase_orders (id, organization_id),
  constraint ck_srl_po check ((status = 'in_purchase') = (purchase_order_id is not null))
);
create index if not exists idx_supply_lines_open
  on public.supply_request_lines (site_id, product_id) where status = 'open';

-- Lien commande \u2192 besoin d'origine (tra\xE7abilit\xE9 de bout en bout).
alter table public.purchase_order_lines
  add column if not exists supply_request_line_id uuid references public.supply_request_lines(id);

create or replace function gescatering_internal.assign_supply_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.reference := gescatering_internal.next_reference(new.organization_id, 'supply_request', 'BA');
  return new;
end $$;

drop trigger if exists trg_supply_reference on public.supply_requests;
create trigger trg_supply_reference before insert on public.supply_requests
  for each row execute function gescatering_internal.assign_supply_reference();

select platform.attach_org_immutability('public', 'supply_requests');
select platform.attach_org_immutability('public', 'supply_request_lines');
select platform.attach_updated_at('public', 'supply_request_lines');
select platform.attach_audit('public', 'supply_request_lines');

alter table public.supply_requests      enable row level security;
alter table public.supply_request_lines enable row level security;
revoke all on public.supply_requests, public.supply_request_lines from anon, authenticated;
grant select on public.supply_requests, public.supply_request_lines to authenticated;

drop policy if exists supply_requests_select on public.supply_requests;
create policy supply_requests_select on public.supply_requests
  for select to authenticated
  using ((platform.has_permission(organization_id, 'purchase.read')
          or platform.has_permission(organization_id, 'need.transmit'))
         and platform.in_scope(organization_id, 'site', site_id));
drop policy if exists supply_request_lines_select on public.supply_request_lines;
create policy supply_request_lines_select on public.supply_request_lines
  for select to authenticated
  using ((platform.has_permission(organization_id, 'purchase.read')
          or platform.has_permission(organization_id, 'need.transmit'))
         and platform.in_scope(organization_id, 'site', site_id));

-- Commande annul\xE9e : ses besoins redeviennent \xAB \xE0 traiter \xBB par les achats
-- (ils ne disparaissent pas avec la commande).
create or replace function gescatering_internal.reopen_supply_lines_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.supply_request_lines
       set status = 'open', purchase_order_id = null
     where purchase_order_id = new.id and status = 'in_purchase';
  end if;
  return null;
end $$;

drop trigger if exists trg_po_reopen_supply on public.purchase_orders;
create trigger trg_po_reopen_supply after update of status on public.purchase_orders
  for each row execute function gescatering_internal.reopen_supply_lines_on_cancel();

-- Ligne de commande supprim\xE9e du brouillon : le besoin revient aux achats.
create or replace function gescatering_internal.reopen_supply_line_on_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.supply_request_line_id is not null then
    update public.supply_request_lines
       set status = 'open', purchase_order_id = null
     where id = old.supply_request_line_id and status = 'in_purchase';
  end if;
  return null;
end $$;

drop trigger if exists trg_pol_reopen_supply on public.purchase_order_lines;
create trigger trg_pol_reopen_supply after delete on public.purchase_order_lines
  for each row execute function gescatering_internal.reopen_supply_line_on_delete();

-- =====================================================================
--  2. LE CALCUL \u2014 une seule d\xE9finition, utilis\xE9e par l'\xE9cran ET par les RPC
-- =====================================================================
create or replace view public.v_supply_needs
with (security_invoker = true)
as
with shortages as (
  select r.site_id, r.product_id,
         sum(r.requested_quantity - r.reserved_quantity - r.issued_quantity) as quantity,
         min(r.needed_by) as first_needed_on,
         array_agg(distinct coalesce(rq.reference, r.source_type)) as sources
    from public.stock_reservations r
    left join public.request_lines rl on r.source_type = 'request_line' and rl.id = r.source_id
    left join public.requests rq      on rq.id = rl.request_id
   where r.status = 'active'
     and r.requested_quantity > r.reserved_quantity + r.issued_quantity
   group by r.site_id, r.product_id
),
transmitted as (
  select site_id, product_id, sum(quantity) as quantity
    from public.supply_request_lines
   where status = 'open'
   group by site_id, product_id
),
purchasing as (
  select po.site_id, l.product_id,
         sum(l.quantity_stock) filter (where po.status in ('draft', 'pending_approval', 'approved'))
           as in_purchasing,
         sum(l.quantity_stock - l.received_quantity) filter (where po.status in ('ordered', 'partially_received'))
           as on_order,
         min(po.expected_date) filter (where po.status in ('ordered', 'partially_received')
                                         and l.quantity_stock > l.received_quantity)
           as next_expected_date
    from public.purchase_orders po
    join public.purchase_order_lines l on l.purchase_order_id = po.id
   where po.status in ('draft', 'pending_approval', 'approved', 'ordered', 'partially_received')
   group by po.site_id, l.product_id
),
base as (
  select s.organization_id, s.id as site_id, s.name as site_name,
         p.id as product_id, p.reference, p.name as product_name, u.code as unit_code,
         coalesce(l.on_hand, 0)  as on_hand,
         coalesce(l.reserved, 0) as reserved,
         coalesce(l.on_hand, 0) - coalesce(l.reserved, 0) as available,
         p.min_stock,
         coalesce(sh.quantity, 0) as reserved_shortage,
         greatest(p.min_stock - (coalesce(l.on_hand, 0) - coalesce(l.reserved, 0)), 0) as min_gap,
         coalesce(t.quantity, 0)      as transmitted,
         coalesce(pu.in_purchasing, 0) as in_purchasing,
         coalesce(pu.on_order, 0)     as on_order,
         pu.next_expected_date,
         sh.first_needed_on,
         coalesce(sh.sources, '{}')   as sources
    from public.sites s
    join public.products p on p.organization_id = s.organization_id and p.is_active
    join public.units u on u.id = p.stock_unit_id
    left join public.stock_levels l on l.site_id = s.id and l.product_id = p.id
    left join shortages sh   on sh.site_id = s.id and sh.product_id = p.id
    left join transmitted t  on t.site_id = s.id and t.product_id = p.id
    left join purchasing pu  on pu.site_id = s.id and pu.product_id = p.id
   where s.holds_stock and s.is_active
     and platform.has_permission(s.organization_id, 'stock.read')
     and platform.in_scope(s.organization_id, 'site', s.id)
)
select b.*,
       b.reserved_shortage + b.min_gap as gross_need,
       greatest(b.reserved_shortage + b.min_gap
                - b.transmitted - b.in_purchasing - b.on_order, 0) as to_order,
       -- Attendu, mais apr\xE8s la date du besoin : \xE0 signaler, pas \xE0 ignorer.
       (b.reserved_shortage > 0 and b.first_needed_on is not null
        and (b.next_expected_date is null and b.on_order > 0
             or b.next_expected_date > b.first_needed_on)) as arrives_late
  from base b
 where b.reserved_shortage + b.min_gap > 0
    or b.transmitted > 0 or b.in_purchasing > 0 or b.on_order > 0;

revoke all on public.v_supply_needs from anon;
grant select on public.v_supply_needs to authenticated;

-- =====================================================================
--  3. RPC
-- =====================================================================

-- ---------------------------------------------------------------------
--  Transmission des besoins par le magasin.
--  p_items : [{"product_id": "...", "quantity": 30, "reason": "..."}]
--  Au-del\xE0 du besoin calcul\xE9, un motif est obligatoire : on ne transmet
--  pas deux fois le m\xEAme besoin par erreur (double clic, deux magasiniers).
-- ---------------------------------------------------------------------
create or replace function public.transmit_supply_needs(
  p_site_id uuid,
  p_items   jsonb,
  p_note    text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org     uuid;
  v_sr      uuid;
  v_item    jsonb;
  v_product uuid;
  v_qty     numeric;
  v_need    record;
  v_count   integer := 0;
begin
  v_org := gescatering_internal.authorize_site(p_site_id, 'need.transmit');
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Aucun besoin \xE0 transmettre.' using errcode = '22023';
  end if;

  insert into public.supply_requests (organization_id, site_id, note, created_by)
  values (v_org, p_site_id, p_note, auth.uid())
  returning id into v_sr;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product := (v_item ->> 'product_id')::uuid;
    v_qty := (v_item ->> 'quantity')::numeric;
    perform gescatering_internal.assert_product(v_org, v_product);
    if coalesce(v_qty, 0) <= 0 then
      raise exception 'La quantit\xE9 doit \xEAtre sup\xE9rieure \xE0 z\xE9ro.' using errcode = '22023';
    end if;

    -- Verrou de la ligne de stock : deux transmissions simultan\xE9es du m\xEAme
    -- produit s'ex\xE9cutent l'une apr\xE8s l'autre, la seconde voit la premi\xE8re.
    perform gescatering_internal.lock_level(v_org, p_site_id, v_product);

    select n.to_order, n.first_needed_on, n.product_name, n.unit_code into v_need
      from public.v_supply_needs n
     where n.site_id = p_site_id and n.product_id = v_product;

    if v_qty > coalesce(v_need.to_order, 0)
       and coalesce(trim(v_item ->> 'reason'), '') = '' then
      raise exception 'Quantit\xE9 sup\xE9rieure au besoin restant \xE0 commander (% %) : pr\xE9ciser le motif.',
        trim(to_char(coalesce(v_need.to_order, 0), 'FM999999990.###')), coalesce(v_need.unit_code, '')
        using errcode = '22023',
              hint = 'Ce besoin a peut-\xEAtre d\xE9j\xE0 \xE9t\xE9 transmis ou command\xE9.';
    end if;

    insert into public.supply_request_lines (organization_id, supply_request_id, site_id, product_id,
                                             quantity, calculated_need, needed_by, extra_reason)
    values (v_org, v_sr, p_site_id, v_product, v_qty, coalesce(v_need.to_order, 0),
            v_need.first_needed_on, nullif(trim(v_item ->> 'reason'), ''));
    v_count := v_count + 1;
  end loop;

  return v_sr;
end $$;

-- ---------------------------------------------------------------------
--  Les achats font un BROUILLON de commande \xE0 partir de besoins re\xE7us.
--  Le prix est repris de l'offre fournisseur quand elle existe dans
--  l'unit\xE9 de stock ; sinon il reste \xE0 saisir.
-- ---------------------------------------------------------------------
create or replace function public.create_purchase_order_from_needs(
  p_supply_line_ids uuid[],
  p_supplier_id     uuid,
  p_expected_date   date default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org   uuid;
  v_site  uuid;
  v_sites integer;
  v_po    uuid;
  l       public.supply_request_lines;
begin
  if coalesce(array_length(p_supply_line_ids, 1), 0) = 0 then
    raise exception 'Aucun besoin s\xE9lectionn\xE9.' using errcode = '22023';
  end if;

  select min(organization_id::text)::uuid, min(site_id::text)::uuid, count(distinct site_id)
    into v_org, v_site, v_sites
    from public.supply_request_lines where id = any (p_supply_line_ids);
  if v_org is null or not (v_org = any (platform.current_org_ids())) then
    raise exception 'Besoin introuvable.' using errcode = 'P0002';
  end if;
  if v_sites > 1 then
    raise exception 'Une commande est livr\xE9e sur un seul site : s\xE9parer les besoins par site.' using errcode = '22023';
  end if;
  if not platform.has_permission(v_org, 'purchase.prepare') then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : la pr\xE9paration des commandes revient aux achats.');
  end if;
  if not platform.in_scope(v_org, 'site', v_site) then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e : ce site ne fait pas partie de votre p\xE9rim\xE8tre.');
  end if;
  if not exists (select 1 from public.suppliers
                  where id = p_supplier_id and organization_id = v_org and is_active) then
    raise exception 'Fournisseur introuvable.' using errcode = 'P0002';
  end if;

  insert into public.purchase_orders (organization_id, supplier_id, site_id, expected_date, created_by)
  values (v_org, p_supplier_id, v_site, p_expected_date, auth.uid())
  returning id into v_po;

  for l in select * from public.supply_request_lines
            where id = any (p_supply_line_ids)
            order by id
            for update
  loop
    if l.status <> 'open' then
      raise exception 'Ce besoin est d\xE9j\xE0 pris en charge ou abandonn\xE9.' using errcode = '22023';
    end if;
    insert into public.purchase_order_lines (organization_id, purchase_order_id, product_id,
                                             quantity, unit_price, supply_request_line_id)
    values (v_org, v_po, l.product_id, l.quantity,
            (select sp.unit_price
               from public.supplier_products sp
               join public.products p on p.id = sp.product_id
              where sp.supplier_id = p_supplier_id and sp.product_id = l.product_id
                and sp.unit_id = p.stock_unit_id
              limit 1),
            l.id);
    update public.supply_request_lines
       set status = 'in_purchase', purchase_order_id = v_po
     where id = l.id;
  end loop;

  return v_po;
end $$;

-- ---------------------------------------------------------------------
--  Abandon d'un besoin transmis (achats ou magasin), motif obligatoire.
-- ---------------------------------------------------------------------
create or replace function public.cancel_supply_need(p_supply_line_id uuid, p_reason text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  l public.supply_request_lines;
begin
  select * into l from public.supply_request_lines where id = p_supply_line_id for update;
  if l.id is null or not (l.organization_id = any (platform.current_org_ids())) then
    raise exception 'Besoin introuvable.' using errcode = 'P0002';
  end if;
  if not (platform.has_permission(l.organization_id, 'purchase.prepare')
          or platform.has_permission(l.organization_id, 'need.transmit'))
     or not platform.in_scope(l.organization_id, 'site', l.site_id) then
    perform gescatering_internal.deny('Op\xE9ration refus\xE9e.');
  end if;
  if l.status <> 'open' then
    raise exception 'Seul un besoin non encore command\xE9 peut \xEAtre abandonn\xE9.' using errcode = '22023';
  end if;
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Le motif est obligatoire.' using errcode = '22023';
  end if;
  update public.supply_request_lines
     set status = 'cancelled', cancel_reason = p_reason
   where id = p_supply_line_id;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.transmit_supply_needs(uuid, jsonb, text)',
    'public.create_purchase_order_from_needs(uuid[], uuid, date)',
    'public.cancel_supply_need(uuid, text)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
`},{name:"migrations/C0008__fix_trigger_order.sql",sql:`-- =====================================================================
--  C0008 \u2014 Correctif : ordre des triggers de num\xE9rotation
--
--  ANOMALIE (trouv\xE9e par le test d'int\xE9gration de l'application) :
--  PostgreSQL d\xE9clenche les triggers d'un m\xEAme moment (BEFORE INSERT) par
--  ORDRE ALPHAB\xC9TIQUE DE NOM. Or :
--
--    trg_request_reference      <  trg_requests_org_default     ('_' < 's')
--    trg_po_reference           <  trg_purchase_orders_org_default ('o' < 'u')
--
--  La r\xE9f\xE9rence (DM-\u2026, BC-\u2026) \xE9tait donc calcul\xE9e AVANT que l'organisation
--  soit renseign\xE9e : un client qui n'envoie pas organization_id \u2014 le cas
--  normal, puisque la base la d\xE9duit de l'identit\xE9 \u2014 obtenait l'erreur
--  \xAB null value in column organization_id of relation document_counters \xBB.
--  Les tests en base fournissaient toujours organization_id : ils ne
--  pouvaient pas le voir.
--
--  CORRECTIF : les triggers de num\xE9rotation sont renomm\xE9s avec le pr\xE9fixe
--  \`trg_zz_\` pour s'ex\xE9cuter APR\xC8S tout trigger de remplissage. R\xE8gle pour
--  la suite : tout trigger BEFORE qui D\xC9PEND d'un autre porte un nom qui le
--  classe apr\xE8s lui.
-- =====================================================================

drop trigger if exists trg_request_reference on public.requests;
drop trigger if exists trg_zz_request_reference on public.requests;
create trigger trg_zz_request_reference before insert on public.requests
  for each row execute function gescatering_internal.assign_request_reference();

drop trigger if exists trg_po_reference on public.purchase_orders;
drop trigger if exists trg_zz_po_reference on public.purchase_orders;
create trigger trg_zz_po_reference before insert on public.purchase_orders
  for each row execute function gescatering_internal.assign_po_reference();

drop trigger if exists trg_supply_reference on public.supply_requests;
drop trigger if exists trg_zz_supply_reference on public.supply_requests;
create trigger trg_zz_supply_reference before insert on public.supply_requests
  for each row execute function gescatering_internal.assign_supply_reference();

-- ---------------------------------------------------------------------
--  M\xEAme cause, autres tables. Le cas des unit\xE9s \xE9tait une FAILLE : sans
--  organization_id fourni, check_unit_visible() comparait \xE0 NULL \u2014 donc ne
--  refusait rien \u2014 et une unit\xE9 d'un AUTRE client pouvait \xEAtre r\xE9f\xE9renc\xE9e.
-- ---------------------------------------------------------------------
drop trigger if exists trg_request_line_compute on public.request_lines;
drop trigger if exists trg_zz_request_line_compute on public.request_lines;
create trigger trg_zz_request_line_compute
  before insert or update of product_id, unit_id, quantity on public.request_lines
  for each row execute function gescatering_internal.compute_request_line();

drop trigger if exists trg_pol_stock_quantity on public.purchase_order_lines;
drop trigger if exists trg_zz_pol_stock_quantity on public.purchase_order_lines;
create trigger trg_zz_pol_stock_quantity
  before insert or update of product_id, unit_id, quantity on public.purchase_order_lines
  for each row execute function gescatering_internal.compute_line_stock_quantity();

drop trigger if exists trg_products_unit_visible on public.products;
drop trigger if exists trg_zz_products_unit_visible on public.products;
create trigger trg_zz_products_unit_visible before insert or update on public.products
  for each row execute function public.check_unit_visible('stock_unit_id', 'purchase_unit_id');

drop trigger if exists trg_conv_unit_visible on public.product_unit_conversions;
drop trigger if exists trg_zz_conv_unit_visible on public.product_unit_conversions;
create trigger trg_zz_conv_unit_visible before insert or update on public.product_unit_conversions
  for each row execute function public.check_unit_visible('unit_id');

drop trigger if exists trg_conv_validation on public.product_unit_conversions;
drop trigger if exists trg_zz_conv_validation on public.product_unit_conversions;
create trigger trg_zz_conv_validation before insert or update on public.product_unit_conversions
  for each row execute function public.stamp_conversion_validation();

drop trigger if exists trg_sp_unit_visible on public.supplier_products;
drop trigger if exists trg_zz_sp_unit_visible on public.supplier_products;
create trigger trg_zz_sp_unit_visible before insert or update on public.supplier_products
  for each row execute function public.check_unit_visible('unit_id');

-- Ceinture : une organisation absente n'est plus jamais \xAB compatible \xBB.
create or replace function public.check_unit_visible()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit_org uuid;
  v_col      text;
  v_unit     uuid;
begin
  if new.organization_id is null then
    raise exception 'Organisation non renseign\xE9e.' using errcode = '23502';
  end if;
  foreach v_col in array tg_argv loop
    v_unit := (to_jsonb(new) ->> v_col)::uuid;
    continue when v_unit is null;
    select organization_id into v_unit_org from public.units where id = v_unit;
    if v_unit_org is not null and v_unit_org <> new.organization_id then
      raise exception 'Unit\xE9 inconnue pour cette organisation.' using errcode = '23503';
    end if;
  end loop;
  return new;
end $$;
revoke all on function public.check_unit_visible() from public, anon, authenticated;
`},{name:"migrations/C0009__purchasing_views_and_replenishment.sql",sql:`-- =====================================================================
--  C0009 \u2014 Achats : vues de lecture, et r\xE9servation automatique \xE0 l'entr\xE9e
--
--  1. R\xC9SERVATION AUTOMATIQUE DU STOCK QUI ENTRE
--     Une demande valid\xE9e mais non couverte attend du stock. Quand du stock
--     ENTRE (r\xE9ception, retour, transfert, ajustement +), il sert d'abord
--     ces besoins en attente, par date de besoin puis ordre de validation.
--     Sans cela, le magasin devrait relancer chaque r\xE9servation \xE0 la main
--     apr\xE8s chaque livraison \u2014 et l'oubli laisserait le stock \xAB disponible \xBB
--     pour le premier venu.
--     R\xE9glable par organisation : catering_settings.auto_reserve_on_receipt
--     (activ\xE9 par d\xE9faut).
--
--  2. VUES POUR LES \xC9CRANS D'ACHAT (security_invoker : la RLS s'applique)
--     v_open_supply_needs   besoins re\xE7us des magasins, \xE0 traiter
--     v_purchase_orders     commandes avec fournisseur, total, retard
--     v_purchase_order_lines lignes avec produit, unit\xE9, reliquat
-- =====================================================================

alter table public.catering_settings
  add column if not exists auto_reserve_on_receipt boolean not null default true;

-- ---------------------------------------------------------------------
--  1. Compl\xE9ment des r\xE9servations en attente
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.replenish_waiting_reservations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r      public.stock_reservations;
  v_auto boolean;
begin
  if new.quantity_delta <= 0 then
    return null;
  end if;
  select auto_reserve_on_receipt into v_auto
    from public.catering_settings where organization_id = new.organization_id;
  if v_auto is false then
    return null;
  end if;

  for r in
    select * from public.stock_reservations
     where site_id = new.site_id and product_id = new.product_id
       and status = 'active'
       and requested_quantity > reserved_quantity + issued_quantity
     order by needed_by nulls last, created_at
  loop
    -- reserve_core compl\xE8te dans la limite du disponible ; quand il n'y a
    -- plus rien, les suivantes restent en attente.
    perform gescatering_internal.reserve_core(
      r.organization_id, r.site_id, r.product_id, r.requested_quantity,
      r.source_type, r.source_id, r.needed_by);
  end loop;
  return null;
end $$;

drop trigger if exists trg_stock_movements_replenish on public.stock_movements;
create trigger trg_stock_movements_replenish
  after insert on public.stock_movements
  for each row execute function gescatering_internal.replenish_waiting_reservations();

revoke all on function gescatering_internal.replenish_waiting_reservations() from public, anon, authenticated;

-- ---------------------------------------------------------------------
--  2. Vues
-- ---------------------------------------------------------------------
create or replace view public.v_open_supply_needs
with (security_invoker = true)
as
select
  l.id                 as line_id,
  l.organization_id,
  l.site_id,
  s.name               as site_name,
  sr.reference         as supply_reference,
  l.product_id,
  p.reference          as product_reference,
  p.name               as product_name,
  u.code               as unit_code,
  l.quantity,
  l.calculated_need,
  l.extra_reason,
  l.needed_by,
  sr.created_at        as transmitted_at,
  (select sp.unit_price from public.supplier_products sp
    where sp.product_id = l.product_id and sp.unit_id = p.stock_unit_id
    order by sp.is_preferred desc, sp.unit_price nulls last limit 1) as best_known_price
from public.supply_request_lines l
join public.supply_requests sr on sr.id = l.supply_request_id
join public.sites s            on s.id = l.site_id
join public.products p         on p.id = l.product_id
join public.units u            on u.id = p.stock_unit_id
where l.status = 'open';

create or replace view public.v_purchase_orders
with (security_invoker = true)
as
select
  po.id,
  po.organization_id,
  po.reference,
  po.status,
  po.site_id,
  s.name                       as site_name,
  po.supplier_id,
  f.name                       as supplier_name,
  f.phone                      as supplier_phone,
  po.expected_date,
  po.notes,
  po.rejection_reason,
  po.cancel_reason,
  po.created_at,
  po.submitted_at,
  po.approved_at,
  po.approval_mode,
  po.ordered_at,
  count(l.id)                  as line_count,
  coalesce(sum(l.quantity * l.unit_price), 0) as total_known,
  bool_or(l.unit_price is null) as has_unpriced,
  count(l.id) filter (where l.received_quantity < l.quantity_stock) as lines_remaining,
  (po.status in ('ordered', 'partially_received')
   and po.expected_date is not null and po.expected_date < current_date) as is_late
from public.purchase_orders po
join public.sites s          on s.id = po.site_id
left join public.suppliers f on f.id = po.supplier_id
left join public.purchase_order_lines l on l.purchase_order_id = po.id
group by po.id, s.name, f.name, f.phone;

create or replace view public.v_purchase_order_lines
with (security_invoker = true)
as
select
  l.id,
  l.organization_id,
  l.purchase_order_id,
  l.product_id,
  p.name                                  as product_name,
  su.code                                 as stock_unit_code,
  coalesce(ou.code, su.code)              as order_unit_code,
  l.quantity,
  l.unit_price,
  l.quantity * l.unit_price               as line_total,
  l.quantity_stock,
  l.received_quantity,
  l.quantity_stock - l.received_quantity  as remaining,
  l.note,
  l.supply_request_line_id
from public.purchase_order_lines l
join public.products p  on p.id = l.product_id
join public.units su    on su.id = p.stock_unit_id
left join public.units ou on ou.id = l.unit_id;

revoke all on public.v_open_supply_needs, public.v_purchase_orders, public.v_purchase_order_lines from anon;
grant select on public.v_open_supply_needs, public.v_purchase_orders, public.v_purchase_order_lines to authenticated;
`},{name:"migrations/C0010__recipes.sql",sql:`-- =====================================================================\r
--  C0010 \u2014 FICHES TECHNIQUES\r
--\r
--  Une fiche d\xE9crit un plat pour un nombre de portions : ses ingr\xE9dients,\r
--  leurs quantit\xE9s, les \xE9tapes, le prix de vente et le food cost vis\xE9.\r
--\r
--  R\xE8gles :\r
--  \u2022 UN INGR\xC9DIENT EST UN PRODUIT DU STOCK (product_id obligatoire). Pas\r
--    de texte libre : une ligne en toutes lettres ne se chiffre pas et ne\r
--    se transforme pas en besoin d'achat.\r
--  \u2022 L'unit\xE9 de la recette est libre (g, kg, l, cl, pi\xE8ce\u2026). La conversion\r
--    vers l'unit\xE9 de stock est CALCUL\xC9E \xC0 LA LECTURE (vues ci-dessous) :\r
--    m\xEAme dimension \u2192 facteur exact ; conditionnement (sac, carton\u2026) \u2192\r
--    conversion produit VALID\xC9E. Sans conversion, la ligne est enregistr\xE9e\r
--    mais signal\xE9e \xAB conversion manquante \xBB : co\xFBt et besoins incomplets.\r
--    D\xE8s que le magasin renseigne la conversion, la fiche se corrige seule.\r
--  \u2022 LE CO\xDBT N'EST JAMAIS STOCK\xC9 : prix du fournisseur habituel, relu \xE0\r
--    chaque affichage. Les vues sont en security_invoker : seuls ceux qui\r
--    voient les prix (purchase.read / catalog.manage) voient les co\xFBts.\r
--  \u2022 Modifiable en BROUILLON seulement. La validation (recipe.validate,\r
--    direction) exige au moins un ingr\xE9dient et AUCUNE conversion\r
--    manquante : une fiche valid\xE9e doit pouvoir calculer des besoins.\r
-- =====================================================================\r
\r
create table if not exists public.recipes (\r
  id                   uuid primary key default gen_random_uuid(),\r
  organization_id      uuid not null references platform.organizations(id) on delete cascade,\r
  reference            text,\r
  name                 text not null check (length(trim(name)) > 0),\r
  category             text,\r
  portions             numeric(10,2) not null default 10 check (portions > 0),\r
  sale_price           numeric(14,2) check (sale_price >= 0),         -- par portion\r
  target_food_cost_pct numeric(5,2) check (target_food_cost_pct > 0 and target_food_cost_pct <= 100),\r
  steps                text,\r
  notes                text,\r
  status               text not null default 'draft' check (status in ('draft', 'validated', 'archived')),\r
  created_by           uuid references auth.users(id) on delete set null default auth.uid(),\r
  validated_by         uuid references auth.users(id) on delete set null,\r
  validated_at         timestamptz,\r
  reopen_reason        text,\r
  created_at           timestamptz not null default now(),\r
  updated_at           timestamptz not null default now(),\r
  constraint uq_recipes_id_org unique (id, organization_id),\r
  constraint uq_recipes_reference unique (organization_id, reference),\r
  constraint ck_recipes_validated check (status <> 'validated' or (validated_by is not null and validated_at is not null))\r
);\r
\r
create table if not exists public.recipe_lines (\r
  id              uuid primary key default gen_random_uuid(),\r
  organization_id uuid not null references platform.organizations(id) on delete cascade,\r
  recipe_id       uuid not null,\r
  product_id      uuid not null,\r
  quantity        numeric(14,4) not null check (quantity > 0),   -- pour \`recipes.portions\` portions\r
  unit_id         uuid not null references public.units(id),\r
  position        integer not null default 0,\r
  note            text,\r
  created_at      timestamptz not null default now(),\r
  updated_at      timestamptz not null default now(),\r
  constraint uq_recipe_lines_id_org unique (id, organization_id),\r
  -- Un produit une seule fois par fiche : deux lignes fausseraient les besoins.\r
  constraint uq_recipe_line_product unique (recipe_id, product_id),\r
  constraint fk_rl_recipe foreign key (recipe_id, organization_id)\r
    references public.recipes (id, organization_id) on delete cascade,\r
  constraint fk_rl_product foreign key (product_id, organization_id)\r
    references public.products (id, organization_id)\r
);\r
create index if not exists idx_recipe_lines_recipe on public.recipe_lines (recipe_id, position);\r
create index if not exists idx_recipe_lines_product on public.recipe_lines (product_id);\r
\r
do $$\r
begin\r
  perform platform.attach_updated_at('public', 'recipes');\r
  perform platform.attach_org_immutability('public', 'recipes');\r
  perform platform.attach_org_default('public', 'recipes');\r
  perform platform.attach_updated_at('public', 'recipe_lines');\r
  perform platform.attach_org_immutability('public', 'recipe_lines');\r
  perform platform.attach_org_default('public', 'recipe_lines');\r
end $$;\r
select platform.attach_audit('public', 'recipes');\r
select platform.attach_audit('public', 'recipe_lines');\r
\r
-- R\xE9f\xE9rence attribu\xE9e par la base, APR\xC8S l'organisation (ordre alphab\xE9tique : trg_zz_).\r
create or replace function gescatering_internal.assign_recipe_reference()\r
returns trigger language plpgsql security definer set search_path = '' as $$\r
begin\r
  new.reference := gescatering_internal.next_reference(new.organization_id, 'recipe', 'FT');\r
  return new;\r
end $$;\r
drop trigger if exists trg_zz_recipe_reference on public.recipes;\r
create trigger trg_zz_recipe_reference before insert on public.recipes\r
  for each row execute function gescatering_internal.assign_recipe_reference();\r
\r
drop trigger if exists trg_zz_rl_unit_visible on public.recipe_lines;\r
create trigger trg_zz_rl_unit_visible before insert or update on public.recipe_lines\r
  for each row execute function public.check_unit_visible('unit_id');\r
\r
-- ---------------------------------------------------------------------\r
--  RLS \u2014 lecture : tout membre qui lit le catalogue ; \xE9criture : brouillons,\r
--  recipe.manage. Le statut ne s'\xE9crit que par les RPC.\r
-- ---------------------------------------------------------------------\r
create or replace function gescatering_internal.recipe_is_editable_draft(p_recipe_id uuid)\r
returns boolean language sql stable security definer set search_path = '' as $$\r
  select exists (select 1 from public.recipes r\r
                  where r.id = p_recipe_id and r.status = 'draft'\r
                    and platform.has_permission(r.organization_id, 'recipe.manage'));\r
$$;\r
revoke all on function gescatering_internal.recipe_is_editable_draft(uuid) from public, anon;\r
grant execute on function gescatering_internal.recipe_is_editable_draft(uuid) to authenticated;\r
\r
alter table public.recipes      enable row level security;\r
alter table public.recipe_lines enable row level security;\r
\r
drop policy if exists recipes_select on public.recipes;\r
create policy recipes_select on public.recipes for select to authenticated\r
  using (platform.has_permission(organization_id, 'catalog.read'));\r
drop policy if exists recipes_insert on public.recipes;\r
create policy recipes_insert on public.recipes for insert to authenticated\r
  with check (status = 'draft' and platform.has_permission(organization_id, 'recipe.manage'));\r
drop policy if exists recipes_update on public.recipes;\r
create policy recipes_update on public.recipes for update to authenticated\r
  using      (status = 'draft' and platform.has_permission(organization_id, 'recipe.manage'))\r
  with check (status = 'draft' and platform.has_permission(organization_id, 'recipe.manage'));\r
drop policy if exists recipes_delete on public.recipes;\r
create policy recipes_delete on public.recipes for delete to authenticated\r
  using (status = 'draft' and platform.has_permission(organization_id, 'recipe.manage'));\r
\r
drop policy if exists recipe_lines_select on public.recipe_lines;\r
create policy recipe_lines_select on public.recipe_lines for select to authenticated\r
  using (exists (select 1 from public.recipes r where r.id = recipe_id));\r
drop policy if exists recipe_lines_insert on public.recipe_lines;\r
create policy recipe_lines_insert on public.recipe_lines for insert to authenticated\r
  with check (gescatering_internal.recipe_is_editable_draft(recipe_id));\r
drop policy if exists recipe_lines_update on public.recipe_lines;\r
create policy recipe_lines_update on public.recipe_lines for update to authenticated\r
  using      (gescatering_internal.recipe_is_editable_draft(recipe_id))\r
  with check (gescatering_internal.recipe_is_editable_draft(recipe_id));\r
drop policy if exists recipe_lines_delete on public.recipe_lines;\r
create policy recipe_lines_delete on public.recipe_lines for delete to authenticated\r
  using (gescatering_internal.recipe_is_editable_draft(recipe_id));\r
\r
revoke all on public.recipes, public.recipe_lines from anon, authenticated;\r
grant select, delete on public.recipes, public.recipe_lines to authenticated;\r
grant insert (organization_id, name, category, portions, sale_price, target_food_cost_pct, steps, notes)\r
  on public.recipes to authenticated;\r
grant update (name, category, portions, sale_price, target_food_cost_pct, steps, notes)\r
  on public.recipes to authenticated;\r
grant insert (organization_id, recipe_id, product_id, quantity, unit_id, position, note)\r
  on public.recipe_lines to authenticated;\r
grant update (quantity, unit_id, position, note) on public.recipe_lines to authenticated;\r
\r
-- ---------------------------------------------------------------------\r
--  CALCULS (\xE0 la lecture)\r
-- ---------------------------------------------------------------------\r
-- Conversion \xAB douce \xBB : NULL au lieu d'une erreur quand elle est inconnue.\r
create or replace function gescatering_internal.try_convert_to_stock_unit(\r
  p_product_id uuid, p_unit_id uuid, p_quantity numeric)\r
returns numeric language plpgsql stable set search_path = '' as $$\r
begin\r
  return public.convert_to_stock_unit(p_product_id, p_unit_id, p_quantity);\r
exception when others then\r
  return null;\r
end $$;\r
grant execute on function gescatering_internal.try_convert_to_stock_unit(uuid, uuid, numeric) to authenticated;\r
\r
create or replace view public.v_recipe_lines\r
with (security_invoker = true)\r
as\r
with base as (\r
  select l.id as line_id, l.organization_id, l.recipe_id, l.position, l.product_id, l.quantity, l.unit_id, l.note,\r
         r.portions,\r
         p.name as product_name, p.reference as product_reference, c.name as category_name,\r
         su.code as stock_unit_code, u.code as unit_code, u.label as unit_label,\r
         gescatering_internal.try_convert_to_stock_unit(l.product_id, l.unit_id, l.quantity) as quantity_stock,\r
         (select sp.unit_price from public.supplier_products sp\r
           where sp.product_id = l.product_id and sp.unit_id = p.stock_unit_id and sp.unit_price is not null\r
           order by sp.is_preferred desc, sp.unit_price limit 1) as unit_price,\r
         -- Disponible tous sites ; 0 si aucun stock, NULL si le r\xF4le ne voit pas le stock.\r
         case when platform.has_permission(l.organization_id, 'stock.read')\r
              then coalesce((select sum(sl.on_hand - sl.reserved) from public.stock_levels sl\r
                              where sl.product_id = l.product_id), 0) end as available\r
    from public.recipe_lines l\r
    join public.recipes r    on r.id = l.recipe_id\r
    join public.products p   on p.id = l.product_id\r
    left join public.product_categories c on c.id = p.category_id\r
    join public.units su     on su.id = p.stock_unit_id\r
    join public.units u      on u.id = l.unit_id\r
)\r
select b.*,\r
       b.quantity_stock is null                       as conversion_missing,\r
       b.quantity_stock * b.unit_price                as line_cost,\r
       b.quantity_stock / b.portions                  as stock_per_portion,\r
       case when b.quantity_stock > 0 and b.available is not null\r
            then floor(greatest(b.available, 0) / (b.quantity_stock / b.portions)) end as portions_possible\r
  from base b;\r
\r
create or replace view public.v_recipes\r
with (security_invoker = true)\r
as\r
select r.id, r.organization_id, r.reference, r.name, r.category, r.portions, r.sale_price,\r
       r.target_food_cost_pct, r.steps, r.notes, r.status, r.validated_at, r.reopen_reason,\r
       r.created_at, r.updated_at,\r
       count(l.line_id)                                             as line_count,\r
       count(l.line_id) filter (where l.conversion_missing)         as missing_conversions,\r
       count(l.line_id) filter (where l.unit_price is null)         as unpriced_lines,\r
       coalesce(sum(l.line_cost), 0)                                as material_cost_known,\r
       (count(l.line_id) > 0 and bool_and(l.line_cost is not null)) as cost_complete,\r
       coalesce(sum(l.line_cost), 0) / r.portions                   as cost_per_portion_known,\r
       case when r.sale_price > 0 then 100 * coalesce(sum(l.line_cost), 0) / r.portions / r.sale_price end\r
                                                                    as food_cost_pct,\r
       case when r.sale_price > 0 and r.target_food_cost_pct is not null\r
            then r.sale_price * r.target_food_cost_pct / 100 end    as target_cost_per_portion,\r
       min(l.portions_possible)                                     as portions_possible,\r
       (array_agg(l.product_name order by l.portions_possible nulls last))[1] as limiting_product\r
  from public.recipes r\r
  left join public.v_recipe_lines l on l.recipe_id = r.id\r
 group by r.id;\r
\r
grant select on public.v_recipes, public.v_recipe_lines to authenticated;\r
revoke all on public.v_recipes, public.v_recipe_lines from anon;\r
\r
-- ---------------------------------------------------------------------\r
--  CYCLE DE VIE\r
-- ---------------------------------------------------------------------\r
create or replace function public.validate_recipe(p_recipe_id uuid)\r
returns text language plpgsql volatile security definer set search_path = '' as $$\r
declare\r
  v public.recipes;\r
  v_lines int;\r
  v_missing text;\r
begin\r
  select * into v from public.recipes where id = p_recipe_id for update;\r
  if v.id is null or not (v.organization_id = any (platform.current_org_ids())) then\r
    raise exception 'Fiche introuvable.' using errcode = 'P0002';\r
  end if;\r
  if not platform.has_permission(v.organization_id, 'recipe.validate') then\r
    raise exception 'Seule la Production valide une fiche technique.' using errcode = '42501';\r
  end if;\r
  if v.status <> 'draft' then\r
    raise exception 'Cette fiche n''est pas un brouillon.' using errcode = '22023';\r
  end if;\r
  select count(*) into v_lines from public.recipe_lines where recipe_id = p_recipe_id;\r
  if v_lines = 0 then\r
    raise exception 'Une fiche sans ingr\xE9dient ne se valide pas.' using errcode = '22023';\r
  end if;\r
  select string_agg(p.name, ', ' order by p.name) into v_missing\r
    from public.recipe_lines l join public.products p on p.id = l.product_id\r
   where l.recipe_id = p_recipe_id\r
     and gescatering_internal.try_convert_to_stock_unit(l.product_id, l.unit_id, l.quantity) is null;\r
  if v_missing is not null then\r
    raise exception 'Conversion manquante pour : %. Le Stock doit renseigner le contenu du conditionnement.', v_missing\r
      using errcode = '22023';\r
  end if;\r
  update public.recipes\r
     set status = 'validated', validated_by = auth.uid(), validated_at = now(), reopen_reason = null\r
   where id = p_recipe_id;\r
  return 'validated';\r
end $$;\r
\r
create or replace function public.reopen_recipe(p_recipe_id uuid, p_reason text)\r
returns text language plpgsql volatile security definer set search_path = '' as $$\r
declare v public.recipes;\r
begin\r
  select * into v from public.recipes where id = p_recipe_id for update;\r
  if v.id is null or not (v.organization_id = any (platform.current_org_ids())) then\r
    raise exception 'Fiche introuvable.' using errcode = 'P0002';\r
  end if;\r
  if not (platform.has_permission(v.organization_id, 'recipe.manage')\r
          or platform.has_permission(v.organization_id, 'recipe.validate')) then\r
    raise exception 'Droit insuffisant pour modifier une fiche technique.' using errcode = '42501';\r
  end if;\r
  if v.status <> 'validated' then\r
    raise exception 'Seule une fiche valid\xE9e se remet en brouillon.' using errcode = '22023';\r
  end if;\r
  if nullif(trim(p_reason), '') is null then\r
    raise exception 'Le motif est obligatoire.' using errcode = '22023';\r
  end if;\r
  update public.recipes\r
     set status = 'draft', validated_by = null, validated_at = null, reopen_reason = trim(p_reason)\r
   where id = p_recipe_id;\r
  return 'draft';\r
end $$;\r
\r
-- Copie d'une fiche (brouillon), pour d\xE9cliner un plat.\r
create or replace function public.duplicate_recipe(p_recipe_id uuid)\r
returns uuid language plpgsql volatile security definer set search_path = '' as $$\r
declare v public.recipes; v_new uuid;\r
begin\r
  select * into v from public.recipes where id = p_recipe_id;\r
  if v.id is null or not (v.organization_id = any (platform.current_org_ids())) then\r
    raise exception 'Fiche introuvable.' using errcode = 'P0002';\r
  end if;\r
  if not platform.has_permission(v.organization_id, 'recipe.manage') then\r
    raise exception 'Droit insuffisant pour cr\xE9er une fiche technique.' using errcode = '42501';\r
  end if;\r
  insert into public.recipes (organization_id, name, category, portions, sale_price, target_food_cost_pct,\r
                              steps, notes, created_by)\r
  values (v.organization_id, v.name || ' (copie)', v.category, v.portions, v.sale_price,\r
          v.target_food_cost_pct, v.steps, v.notes, auth.uid())\r
  returning id into v_new;\r
  insert into public.recipe_lines (organization_id, recipe_id, product_id, quantity, unit_id, position, note)\r
  select organization_id, v_new, product_id, quantity, unit_id, position, note\r
    from public.recipe_lines where recipe_id = p_recipe_id;\r
  return v_new;\r
end $$;\r
\r
revoke all on function public.validate_recipe(uuid), public.reopen_recipe(uuid, text),\r
  public.duplicate_recipe(uuid) from public, anon;\r
grant execute on function public.validate_recipe(uuid), public.reopen_recipe(uuid, text),\r
  public.duplicate_recipe(uuid) to authenticated;\r
revoke all on function gescatering_internal.assign_recipe_reference() from public, anon, authenticated;\r
`},{name:"migrations/C0011__recipe_catalogue.sql",sql:`-- =====================================================================
--  C0011 \u2014 Catalogue de plats : amorcer une fiche technique
--
--  Le concepteur de fiches part d'une page blanche : le chef saisit vingt
--  lignes avant de voir le premier co\xFBt. Ce module lui donne un POINT DE
--  D\xC9PART \u2014 un catalogue de plats, en grammage par portion, que la base
--  rattache aux produits de SON stock. Le contenu est dans C0012.
--
--  Trois principes, et ce sont eux qui rendent la chose utilisable :
--
--   1. Une fiche engendr\xE9e est une PROPOSITION. Elle na\xEEt en brouillon,
--      la cuisine corrige les grammages, la Production valide le co\xFBt.
--      Rien n'entre dans un chiffrage sans ces deux gestes.
--   2. On ne DEVINE jamais un produit. Un ingr\xE9dient se rattache par une
--      correspondance d\xE9cid\xE9e par la maison, ou par un synonyme exact.
--      Deux candidats possibles \u21D2 aucun : la ligne se signale \xAB \xE0
--      compl\xE9ter \xBB plut\xF4t que d'engager le mauvais produit dans un co\xFBt.
--      C'est le choix de \`convert_to_stock_unit\` : refuser, pas deviner.
--   3. Le catalogue ne CR\xC9E jamais de produit. Un ingr\xE9dient absent du
--      stock reste absent, et la liste des manques est pr\xE9cis\xE9ment ce que
--      la g\xE9n\xE9ration fait appara\xEEtre \u2014 elle vaut audit du r\xE9f\xE9rentiel.
--
--  Le catalogue livr\xE9 est au niveau du PRODUIT (\`organization_id\` null),
--  comme les unit\xE9s ; une maison peut y ajouter ses propres plats.
--
--  \u26A0\uFE0F Ce que ce module ne sait pas, et ne peut pas savoir : les grammages
--     que la maison sert r\xE9ellement. Il les propose, il ne les constate
--     pas. Les sorties de stock, elles, les constatent \u2014 c'est une source
--     plus juste, et un chantier distinct.
-- =====================================================================


-- ---------------------------------------------------------------------
--  1. NORMALISATION DES LIBELL\xC9S
--
--  Le catalogue client s'\xE9crit sans accents et sans r\xE9gularit\xE9 : \xAB Pate
--  d'arachide \xBB, \xAB Netetou en poudre \xBB, \xAB Oignon locale \xBB. Toute
--  comparaison passe donc par cette forme : minuscules, accents retir\xE9s,
--  ponctuation remplac\xE9e par une espace, espaces r\xE9duits \xE0 une seule.
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.normalize_label(p_text text)
returns text
language sql
immutable
set search_path = ''
as $fn$
  select nullif(
    trim(regexp_replace(
      translate(
        replace(replace(lower(coalesce(p_text, '')), '\u0153', 'oe'), '\xE6', 'ae'),
        '\xE0\xE2\xE4\xE1\xE3\xE5\xE7\xE9\xE8\xEA\xEB\xED\xEC\xEE\xEF\xF1\xF3\xF2\xF4\xF6\xF5\xFA\xF9\xFB\xFC\xFD\xFF',
        'aaaaaaceeeeiiiinooooouuuuyy'),
      '[^a-z0-9]+', ' ', 'g')),
    '');
$fn$;

comment on function gescatering_internal.normalize_label(text) is
  'Forme comparable d''un libell\xE9 : minuscules, sans accents, ponctuation en espaces. '
  'Rapproche le vocabulaire du catalogue de plats des noms r\xE9els des produits.';

create index if not exists idx_products_normalized_name
  on public.products (organization_id, gescatering_internal.normalize_label(name));


-- ---------------------------------------------------------------------
--  2. LE CATALOGUE DE PLATS
--
--  Les quantit\xE9s sont POUR UNE PORTION, dans une unit\xE9 de base (g, ml,
--  pi\xE8ce) : la g\xE9n\xE9ration multiplie par le nombre de couverts demand\xE9.
--  C'est la seule forme qui se transpose d'un client \xE0 l'autre.
-- ---------------------------------------------------------------------
create table if not exists public.recipe_templates (
  id              uuid primary key default gen_random_uuid(),
  -- null = catalogue livr\xE9 avec le produit ; sinon, plat propre \xE0 la maison.
  organization_id uuid references platform.organizations(id) on delete cascade,
  key             text not null check (key ~ '^[a-z][a-z0-9_]*$'),
  name            text not null check (length(trim(name)) > 0),
  category        text,              -- align\xE9 sur les cat\xE9gories de fiches
  service         text not null default 'cuisine'
                    check (service in ('cuisine', 'fast_food', 'patisserie', 'petit_dejeuner')),
  steps           text,
  notes           text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_recipe_templates_key unique nulls not distinct (organization_id, key)
);

create table if not exists public.recipe_template_lines (
  id                   uuid primary key default gen_random_uuid(),
  template_id          uuid not null references public.recipe_templates(id) on delete cascade,
  ingredient_key       text not null check (ingredient_key ~ '^[a-z][a-z0-9_]*$'),
  -- Quantit\xE9 NETTE mise en \u0153uvre, pour une portion.
  quantity_per_portion numeric(14,4) not null check (quantity_per_portion > 0),
  unit_code            text not null check (unit_code in ('g', 'ml', 'piece')),
  -- Perte au parage ou \xE0 l'\xE9pluchage : le brut sorti du magasin vaut
  -- net / (1 \u2212 perte). C'est ce qui explique qu'un kilo d'oignon n'en
  -- donne que 850 grammes dans la marmite.
  loss_pct             numeric(5,2) not null default 0 check (loss_pct >= 0 and loss_pct < 95),
  role                 text not null default 'autre'
                         check (role in ('base', 'proteine', 'legume', 'assaisonnement',
                                         'matiere_grasse', 'accompagnement', 'autre')),
  is_optional          boolean not null default false,
  position             integer not null default 0,
  note                 text,
  constraint uq_template_line unique (template_id, ingredient_key)
);

create index if not exists idx_template_lines_template on public.recipe_template_lines (template_id);


-- ---------------------------------------------------------------------
--  3. LE VOCABULAIRE
--
--  Un ingr\xE9dient g\xE9n\xE9rique (\xAB oignon \xBB) et toutes les fa\xE7ons de l'\xE9crire
--  dans un catalogue r\xE9el. L'unicit\xE9 du synonyme est VOLONTAIRE : un m\xEAme
--  mot ne peut pas d\xE9signer deux ingr\xE9dients, sinon le rattachement
--  deviendrait un tirage au sort.
-- ---------------------------------------------------------------------
create table if not exists public.ingredient_aliases (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references platform.organizations(id) on delete cascade,
  ingredient_key  text not null check (ingredient_key ~ '^[a-z][a-z0-9_]*$'),
  -- Toujours stock\xE9 sous forme normalis\xE9e (trigger ci-dessous).
  alias           text not null check (length(trim(alias)) > 0),
  priority        integer not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_ingredient_alias unique nulls not distinct (organization_id, alias)
);

create index if not exists idx_aliases_key on public.ingredient_aliases (ingredient_key);

create or replace function gescatering_internal.normalize_alias()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  new.alias := gescatering_internal.normalize_label(new.alias);
  if new.alias is null then
    raise exception 'Synonyme vide.' using errcode = '22023';
  end if;
  return new;
end $fn$;

drop trigger if exists trg_aliases_normalize on public.ingredient_aliases;
create trigger trg_aliases_normalize before insert or update on public.ingredient_aliases
  for each row execute function gescatering_internal.normalize_alias();


-- ---------------------------------------------------------------------
--  4. LA CORRESPONDANCE APPRISE
--
--  Le chef corrige un rattachement UNE fois ; la maison s'en souvient.
--  C'est la seule table de ce module qui porte une d\xE9cision humaine, et
--  elle prime sur tout le reste.
-- ---------------------------------------------------------------------
create table if not exists public.recipe_ingredient_products (
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  ingredient_key  text not null check (ingredient_key ~ '^[a-z][a-z0-9_]*$'),
  product_id      uuid not null,
  decided_by      uuid references auth.users(id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (organization_id, ingredient_key),
  constraint fk_rip_product foreign key (product_id, organization_id)
    references public.products (id, organization_id) on delete cascade
);


-- ---------------------------------------------------------------------
--  5. TRIGGERS DU SOCLE
-- ---------------------------------------------------------------------
do $do$
begin
  perform platform.attach_updated_at('public', 'recipe_templates');
  perform platform.attach_updated_at('public', 'recipe_template_lines');
  perform platform.attach_updated_at('public', 'ingredient_aliases');
  perform platform.attach_updated_at('public', 'recipe_ingredient_products');
  -- Pas d'attach_org_default sur le catalogue livr\xE9 : organization_id null
  -- y est une valeur l\xE9gitime, pas un oubli.
  perform platform.attach_org_immutability('public', 'recipe_ingredient_products');
  perform platform.attach_org_default('public', 'recipe_ingredient_products');
end $do$;


-- ---------------------------------------------------------------------
--  6. RLS
--
--  Catalogue et vocabulaire : lecture pour qui voit le r\xE9f\xE9rentiel, le
--  livr\xE9 comme le maison (m\xEAme r\xE8gle que \`units\`). \xC9criture : la maison
--  n'\xE9crit que ses propres lignes, jamais celles du catalogue livr\xE9.
-- ---------------------------------------------------------------------
alter table public.recipe_templates            enable row level security;
alter table public.recipe_template_lines       enable row level security;
alter table public.ingredient_aliases          enable row level security;
alter table public.recipe_ingredient_products  enable row level security;

do $do$
declare t text;
begin
  foreach t in array array['recipe_templates', 'ingredient_aliases'] loop
    execute format('drop policy if exists %1$s_select on public.%1$I', t);
    execute format(
      'create policy %1$s_select on public.%1$I for select to authenticated '
      || 'using (organization_id is null or organization_id = any (platform.current_org_ids()))', t);

    execute format('drop policy if exists %1$s_insert on public.%1$I', t);
    execute format(
      'create policy %1$s_insert on public.%1$I for insert to authenticated '
      || 'with check (organization_id is not null '
      || '            and platform.has_permission(organization_id, ''recipe.manage''))', t);

    execute format('drop policy if exists %1$s_update on public.%1$I', t);
    execute format(
      'create policy %1$s_update on public.%1$I for update to authenticated '
      || 'using      (organization_id is not null '
      || '            and platform.has_permission(organization_id, ''recipe.manage'')) '
      || 'with check (organization_id is not null '
      || '            and platform.has_permission(organization_id, ''recipe.manage''))', t);

    execute format('revoke delete, truncate on public.%I from anon, authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $do$;

-- Les lignes suivent la visibilit\xE9 de leur plat.
drop policy if exists recipe_template_lines_select on public.recipe_template_lines;
create policy recipe_template_lines_select on public.recipe_template_lines
  for select to authenticated
  using (exists (select 1 from public.recipe_templates t where t.id = template_id));
drop policy if exists recipe_template_lines_write on public.recipe_template_lines;
create policy recipe_template_lines_write on public.recipe_template_lines
  for all to authenticated
  using (exists (select 1 from public.recipe_templates t
                  where t.id = template_id and t.organization_id is not null
                    and platform.has_permission(t.organization_id, 'recipe.manage')))
  with check (exists (select 1 from public.recipe_templates t
                       where t.id = template_id and t.organization_id is not null
                         and platform.has_permission(t.organization_id, 'recipe.manage')));
revoke truncate on public.recipe_template_lines from anon, authenticated;
revoke all on public.recipe_template_lines from anon;

-- Correspondance apprise : visible par qui voit le catalogue, d\xE9cid\xE9e par
-- qui tient les fiches.
drop policy if exists recipe_ingredient_products_select on public.recipe_ingredient_products;
create policy recipe_ingredient_products_select on public.recipe_ingredient_products
  for select to authenticated
  using (platform.has_permission(organization_id, 'catalog.read'));
drop policy if exists recipe_ingredient_products_write on public.recipe_ingredient_products;
create policy recipe_ingredient_products_write on public.recipe_ingredient_products
  for all to authenticated
  using      (platform.has_permission(organization_id, 'recipe.manage'))
  with check (platform.has_permission(organization_id, 'recipe.manage'));
revoke truncate on public.recipe_ingredient_products from anon, authenticated;
revoke all on public.recipe_ingredient_products from anon;

grant select on public.recipe_templates, public.recipe_template_lines,
                public.ingredient_aliases to authenticated;
grant select, insert, update, delete on public.recipe_ingredient_products to authenticated;
grant insert, update on public.recipe_templates, public.ingredient_aliases to authenticated;
grant insert, update, delete on public.recipe_template_lines to authenticated;


-- ---------------------------------------------------------------------
--  7. L'ORGANISATION DE L'APPELANT
--
--  Membre de plusieurs organisations : on refuse de choisir, exactement
--  comme \`platform.set_organization_id_default\`.
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.caller_org()
returns uuid
language sql
stable
security definer
set search_path = ''
as $fn$
  select case when array_length(platform.current_org_ids(), 1) = 1
              then (platform.current_org_ids())[1] end;
$fn$;


-- ---------------------------------------------------------------------
--  8. LE RATTACHEMENT \u2014 le c\u0153ur du module
--
--  Trois passes, de la plus s\xFBre \xE0 la plus souple, et un refus par
--  d\xE9faut. Jamais de produit retenu faute d'alternative.
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.match_ingredient(p_org uuid, p_key text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $fn$
declare
  v_product uuid;
  v_ids     uuid[];
begin
  if p_org is null or p_key is null then
    return null;
  end if;

  -- 1. La d\xE9cision de la maison prime sur tout.
  select product_id into v_product
    from public.recipe_ingredient_products
   where organization_id = p_org and ingredient_key = p_key;
  if v_product is not null then
    return v_product;
  end if;

  -- 2. Synonyme EXACTEMENT \xE9gal au nom du produit.
  select p.id into v_product
    from public.products p
    join public.ingredient_aliases a
      on a.alias = gescatering_internal.normalize_label(p.name)
   where p.organization_id = p_org
     and p.is_active
     and a.ingredient_key = p_key
     and (a.organization_id is null or a.organization_id = p_org)
   order by a.priority, p.name
   limit 1;
  if v_product is not null then
    return v_product;
  end if;

  -- 3. Synonyme en T\xCATE du nom : \xAB oignon \xBB \u2192 \xAB Oignon locale \xBB.
  --    Sont \xE9cart\xE9s les produits qui sont le synonyme exact d'un AUTRE
  --    ingr\xE9dient, sans quoi \xAB oignon \xBB attraperait \xAB Oignon vert \xBB.
  --    Et s'il reste deux candidats, on n'en prend aucun.
  with candidat as (
    select distinct p.id
      from public.products p
      join public.ingredient_aliases a
        on gescatering_internal.normalize_label(p.name) like a.alias || ' %'
     where p.organization_id = p_org
       and p.is_active
       and a.ingredient_key = p_key
       and (a.organization_id is null or a.organization_id = p_org)
       and not exists (
         select 1 from public.ingredient_aliases o
          where o.alias = gescatering_internal.normalize_label(p.name)
            and o.ingredient_key <> p_key
            and (o.organization_id is null or o.organization_id = p_org))
  )
  select array_agg(id) into v_ids from candidat;

  if array_length(v_ids, 1) = 1 then
    return v_ids[1];
  end if;
  return null;
end $fn$;

-- Enveloppe pour la vue : l'organisation n'est PAS un param\xE8tre, sinon un
-- membre pourrait sonder le catalogue d'une autre maison en la passant.
create or replace function gescatering_internal.match_for_caller(p_key text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $fn$
  select gescatering_internal.match_ingredient(gescatering_internal.caller_org(), p_key);
$fn$;

comment on function gescatering_internal.match_ingredient(uuid, text) is
  'Produit du stock correspondant \xE0 un ingr\xE9dient du catalogue, ou NULL. '
  'Correspondance d\xE9cid\xE9e > synonyme exact > synonyme en t\xEAte de nom. '
  'Ambigu\xEFt\xE9 = NULL : la ligne se signale au chef au lieu d''\xEAtre devin\xE9e.';


-- ---------------------------------------------------------------------
--  9. PR\xC9SENTATION DES QUANTIT\xC9S
--
--  Une fiche de 100 couverts qui annonce \xAB 15 000 g de riz \xBB est juste et
--  illisible. On remonte au kilo et au litre d\xE8s que c'est plus clair.
-- ---------------------------------------------------------------------
create or replace function gescatering_internal.display_unit(p_unit_code text, p_quantity numeric)
returns text
language sql
immutable
set search_path = ''
as $fn$
  select case when p_unit_code = 'g'  and p_quantity >= 1000 then 'kg'
              when p_unit_code = 'ml' and p_quantity >= 1000 then 'l'
              else p_unit_code end;
$fn$;

create or replace function gescatering_internal.display_quantity(p_unit_code text, p_quantity numeric)
returns numeric
language sql
immutable
set search_path = ''
as $fn$
  select greatest(
    round(case when p_unit_code in ('g', 'ml') and p_quantity >= 1000
               then p_quantity / 1000 else p_quantity end, 3),
    0.001);
$fn$;


-- ---------------------------------------------------------------------
--  10. CE QUE LE CATALOGUE PROPOSE \u2014 vue de choix
--
--  Pour chaque plat : combien de lignes, et combien se rattachent d\xE9j\xE0 au
--  stock de cette maison. Le chef voit d'avance ce qui l'attend.
-- ---------------------------------------------------------------------
create or replace view public.v_recipe_templates
with (security_invoker = true)
as
  select t.id,
         t.organization_id,
         t.key,
         t.name,
         t.category,
         t.service,
         t.sort_order,
         t.notes,
         t.organization_id is null                 as is_shipped,
         count(l.id)                               as line_count,
         count(l.id) filter (where l.is_optional)  as optional_count,
         count(m.product_id)                       as matched_count,
         string_agg(replace(l.ingredient_key, '_', ' '), ', ' order by l.position)
           filter (where m.product_id is null and not l.is_optional) as missing_keys
    from public.recipe_templates t
    left join public.recipe_template_lines l on l.template_id = t.id
    left join lateral (
      select gescatering_internal.match_for_caller(l.ingredient_key) as product_id
    ) m on true
   where t.is_active
   group by t.id, t.organization_id, t.key, t.name, t.category, t.service, t.sort_order, t.notes;

grant select on public.v_recipe_templates to authenticated;


-- ---------------------------------------------------------------------
--  11. APER\xC7U \u2014 ce que donnerait la g\xE9n\xE9ration, avant de l'\xE9crire
--
--  Le chef voit la correspondance AVANT que quoi que ce soit n'existe.
--  C'est ce qui fait de la g\xE9n\xE9ration une proposition, et non un fait.
-- ---------------------------------------------------------------------
create or replace function public.preview_recipe_template(
  p_template_id uuid,
  p_portions    numeric default 10
)
returns table (
  line_position   integer,
  ingredient_key  text,
  role            text,
  is_optional     boolean,
  quantity        numeric,
  unit_code       text,
  product_id      uuid,
  product_name    text,
  stock_unit_code text,
  decided         boolean,
  note            text
)
language plpgsql
stable
security definer
set search_path = ''
as $fn$
declare
  v_org uuid;
begin
  v_org := gescatering_internal.caller_org();
  if v_org is null then
    raise exception 'Aucune organisation active pour cet utilisateur.' using errcode = '42501';
  end if;
  if not platform.has_permission(v_org, 'catalog.read') then
    raise exception 'Droit insuffisant pour consulter le catalogue de plats.' using errcode = '42501';
  end if;
  if p_portions is null or p_portions <= 0 then
    raise exception 'Indiquer un nombre de couverts sup\xE9rieur \xE0 z\xE9ro.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.recipe_templates t
                  where t.id = p_template_id and t.is_active
                    and (t.organization_id is null or t.organization_id = v_org)) then
    raise exception 'Plat introuvable au catalogue.' using errcode = 'P0002';
  end if;

  return query
    with ligne as (
      select l.position as pos, l.ingredient_key as ikey, l.role as irole,
             l.is_optional as iopt, l.note as inote, l.unit_code as base_unit,
             -- Brut sorti du magasin : le net divis\xE9 par le rendement.
             l.quantity_per_portion / (1 - l.loss_pct / 100) * p_portions as brut,
             gescatering_internal.match_ingredient(v_org, l.ingredient_key) as pid
        from public.recipe_template_lines l
       where l.template_id = p_template_id
    )
    select g.pos,
           g.ikey,
           g.irole,
           g.iopt,
           gescatering_internal.display_quantity(g.base_unit, g.brut),
           gescatering_internal.display_unit(g.base_unit, g.brut),
           g.pid,
           p.name,
           u.code,
           exists (select 1 from public.recipe_ingredient_products d
                    where d.organization_id = v_org and d.ingredient_key = g.ikey),
           g.inote
      from ligne g
      left join public.products p on p.id = g.pid
      left join public.units    u on u.id = p.stock_unit_id
     order by g.pos;
end $fn$;


-- ---------------------------------------------------------------------
--  12. G\xC9N\xC9RATION \u2014 une fiche en BROUILLON, et rien de plus
--
--  Ce que la fonction \xE9crit : un brouillon, ses lignes rattachables, et
--  une note qui dit d'o\xF9 il vient et ce qui lui manque. Ce qu'elle
--  n'\xE9crit jamais : un produit, un prix, une validation.
-- ---------------------------------------------------------------------
create or replace function public.create_recipe_from_template(
  p_template_id uuid,
  p_portions    numeric default 10,
  p_name        text    default null,
  p_sale_price  numeric default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $fn$
declare
  v_org    uuid;
  v_tpl    public.recipe_templates;
  v_recipe uuid;
  v_unit   uuid;
  r        record;
  v_pos    integer := 0;
  v_taken  uuid[]  := '{}';
  v_manque text[]  := '{}';
  v_fusion text[]  := '{}';
  v_note   text;
begin
  v_org := gescatering_internal.caller_org();
  if v_org is null then
    raise exception 'Aucune organisation active pour cet utilisateur.' using errcode = '42501';
  end if;
  if not platform.has_permission(v_org, 'recipe.manage') then
    raise exception 'Droit insuffisant pour cr\xE9er une fiche technique.' using errcode = '42501';
  end if;
  if p_portions is null or p_portions <= 0 then
    raise exception 'Indiquer un nombre de couverts sup\xE9rieur \xE0 z\xE9ro.' using errcode = '22023';
  end if;

  select * into v_tpl from public.recipe_templates
   where id = p_template_id and is_active
     and (organization_id is null or organization_id = v_org);
  if v_tpl.id is null then
    raise exception 'Plat introuvable au catalogue.' using errcode = 'P0002';
  end if;

  insert into public.recipes (organization_id, name, category, portions, sale_price,
                              target_food_cost_pct, steps, created_by)
  values (v_org, coalesce(nullif(trim(p_name), ''), v_tpl.name), v_tpl.category, p_portions,
          p_sale_price, 35, v_tpl.steps, auth.uid())
  returning id into v_recipe;

  for r in
    select l.ingredient_key as ikey, l.unit_code as base_unit, l.is_optional as iopt,
           l.note as inote,
           l.quantity_per_portion / (1 - l.loss_pct / 100) * p_portions as brut,
           gescatering_internal.match_ingredient(v_org, l.ingredient_key) as pid
      from public.recipe_template_lines l
     where l.template_id = p_template_id
     order by l.position
  loop
    if r.pid is null then
      -- Ingr\xE9dient sans produit au stock : on le NOMME, on ne l'invente pas.
      if not r.iopt then
        v_manque := v_manque || replace(r.ikey, '_', ' ');
      end if;
      continue;
    end if;
    if r.pid = any (v_taken) then
      -- Deux ingr\xE9dients du mod\xE8le d\xE9signent le m\xEAme produit chez ce
      -- client : on garde la premi\xE8re ligne, et on le dit.
      v_fusion := v_fusion || replace(r.ikey, '_', ' ');
      continue;
    end if;

    select id into v_unit from public.units
     where organization_id is null
       and code = gescatering_internal.display_unit(r.base_unit, r.brut);

    insert into public.recipe_lines (organization_id, recipe_id, product_id, quantity, unit_id, position, note)
    values (v_org, v_recipe, r.pid,
            gescatering_internal.display_quantity(r.base_unit, r.brut), v_unit, v_pos, r.inote);
    v_pos   := v_pos + 1;
    v_taken := v_taken || r.pid;
  end loop;

  if v_pos = 0 then
    raise exception 'Aucun ingr\xE9dient de \xAB % \xBB ne correspond \xE0 un produit du catalogue : la fiche serait vide.',
      v_tpl.name using errcode = '22023',
      hint = 'Faire ajouter ces produits au catalogue, ou rattacher les ingr\xE9dients \xE0 la main.';
  end if;

  v_note := format('Propos\xE9e depuis le catalogue (%s) le %s, pour %s couvert(s). '
                   || 'Grammages \xE0 v\xE9rifier par la cuisine avant validation.',
                   v_tpl.name, to_char(current_date, 'DD/MM/YYYY'),
                   -- \xAB 100 \xBB, pas \xAB 100. \xBB : to_char laisse le point des d\xE9cimales.
                   case when p_portions = trunc(p_portions) then trunc(p_portions)::text
                        else trim(to_char(p_portions, 'FM999999.99')) end);
  if array_length(v_manque, 1) > 0 then
    v_note := v_note || format(E'\\nSans produit au catalogue, \xE0 compl\xE9ter : %s.',
                               array_to_string(v_manque, ', '));
  end if;
  if array_length(v_fusion, 1) > 0 then
    v_note := v_note || format(E'\\nD\xE9j\xE0 couvert par une autre ligne : %s.',
                               array_to_string(v_fusion, ', '));
  end if;
  if v_tpl.notes is not null then
    v_note := v_note || E'\\n' || v_tpl.notes;
  end if;

  update public.recipes set notes = v_note where id = v_recipe;
  return v_recipe;
end $fn$;

comment on function public.create_recipe_from_template(uuid, numeric, text, numeric) is
  'Cr\xE9e une fiche technique en BROUILLON depuis un plat du catalogue. '
  'Ne cr\xE9e aucun produit : les ingr\xE9dients absents du stock sont nomm\xE9s dans la note.';


-- ---------------------------------------------------------------------
--  13. LA CORRECTION DU CHEF \u2014 faite une fois, retenue
-- ---------------------------------------------------------------------
create or replace function public.set_ingredient_product(
  p_ingredient_key text,
  p_product_id     uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $fn$
declare v_org uuid;
begin
  v_org := gescatering_internal.caller_org();
  if v_org is null then
    raise exception 'Aucune organisation active pour cet utilisateur.' using errcode = '42501';
  end if;
  if not platform.has_permission(v_org, 'recipe.manage') then
    raise exception 'Droit insuffisant pour modifier le catalogue de plats.' using errcode = '42501';
  end if;

  if p_product_id is null then
    delete from public.recipe_ingredient_products
     where organization_id = v_org and ingredient_key = p_ingredient_key;
    return;
  end if;

  if not exists (select 1 from public.products
                  where id = p_product_id and organization_id = v_org and is_active) then
    raise exception 'Produit introuvable au catalogue.' using errcode = 'P0002';
  end if;

  insert into public.recipe_ingredient_products (organization_id, ingredient_key, product_id, decided_by)
  values (v_org, p_ingredient_key, p_product_id, auth.uid())
  on conflict (organization_id, ingredient_key)
    do update set product_id = excluded.product_id, decided_by = excluded.decided_by;
end $fn$;


-- ---------------------------------------------------------------------
--  14. EXPOSITION
-- ---------------------------------------------------------------------
revoke all on function gescatering_internal.normalize_alias() from public, anon, authenticated;
revoke all on function gescatering_internal.match_ingredient(uuid, text) from public, anon, authenticated;
revoke all on function gescatering_internal.match_for_caller(text) from public, anon;
grant execute on function gescatering_internal.match_for_caller(text) to authenticated;
revoke all on function gescatering_internal.caller_org() from public, anon;
grant execute on function gescatering_internal.caller_org() to authenticated;
revoke all on function gescatering_internal.normalize_label(text) from public, anon;
grant execute on function gescatering_internal.normalize_label(text) to authenticated;
revoke all on function gescatering_internal.display_unit(text, numeric),
                       gescatering_internal.display_quantity(text, numeric) from public, anon;
grant execute on function gescatering_internal.display_unit(text, numeric),
                          gescatering_internal.display_quantity(text, numeric) to authenticated;
revoke all on function public.preview_recipe_template(uuid, numeric),
                       public.create_recipe_from_template(uuid, numeric, text, numeric),
                       public.set_ingredient_product(text, uuid) from public, anon;
grant execute on function public.preview_recipe_template(uuid, numeric),
                          public.create_recipe_from_template(uuid, numeric, text, numeric),
                          public.set_ingredient_product(text, uuid) to authenticated;
`},{name:"migrations/C0012__recipe_catalogue_data.sql",sql:`-- =====================================================================
--  C0012 \u2014 Le catalogue livr\xE9 : vocabulaire et plats
--
--  Deux contenus, et ils sont de nature diff\xE9rente :
--
--   \u2022 LE VOCABULAIRE (\xA71) : un ingr\xE9dient g\xE9n\xE9rique et toutes les fa\xE7ons
--     de l'\xE9crire dans un catalogue r\xE9el. Il est cal\xE9 sur des noms
--     r\xE9ellement rencontr\xE9s en restauration collective s\xE9n\xE9galaise \u2014
--     \xAB Pate d'arachide \xBB, \xAB Netetou en poudre \xBB, \xAB Oignon locale \xBB,
--     \xAB Gombon \xBB, \xAB Piment gouana sofia \xBB \u2014 et compl\xE9t\xE9 par les \xE9critures
--     standard, pour qu'un autre client se rattache aussi.
--
--   \u2022 LES PLATS (\xA72) : 32 plats, en quantit\xE9 NETTE par portion, avec leur
--     perte au parage. Ce sont des grammages de m\xE9tier, pas les
--     grammages d'une maison : ils donnent un brouillon honn\xEAte, que la
--     cuisine corrige. Une portion = un couvert adulte de collective.
--
--  \u26A0\uFE0F Les quantit\xE9s servent de POINT DE D\xC9PART. La maison qui sert 180 g
--     de riz sec par couvert n'a pas tort : elle a sa grammaire. C'est
--     pourquoi la fiche engendr\xE9e na\xEEt en brouillon et que la validation
--     reste un geste humain.
--
--  \u26A0\uFE0F Un ingr\xE9dient volontairement laiss\xE9 sans \xE9quivalent chez beaucoup
--     de clients (huile, beurre, levure, fromage, Maggi, poivre, pain de
--     burger, farine de bl\xE9, huile de palme) n'est PAS une erreur : la
--     g\xE9n\xE9ration le nomme comme \xAB \xE0 compl\xE9ter \xBB, et cette liste vaut
--     audit du r\xE9f\xE9rentiel produits.
-- =====================================================================


-- ---------------------------------------------------------------------
--  1. LE VOCABULAIRE
--
--  \`priority\` tranche quand plusieurs synonymes existent chez le m\xEAme
--  client : le plus petit gagne. Les \xE9critures locales sont donc
--  prioritaires sur les \xE9critures g\xE9n\xE9riques.
-- ---------------------------------------------------------------------
insert into public.ingredient_aliases (organization_id, ingredient_key, alias, priority) values
  -- C\xE9r\xE9ales, f\xE9culents et farines
  (null, 'riz_brise',          'Riz parfume pithibi',       10),
  (null, 'riz_brise',          'Riz brise',                 20),
  (null, 'riz_brise',          'Riz',                       90),
  (null, 'spaghetti',          'Spaguetty',                 10),
  (null, 'spaghetti',          'Spaghetti',                 20),
  (null, 'spaghetti',          'Pates alimentaires',        30),
  (null, 'vermicelle',         'Vermicelle',                10),
  (null, 'couscous_thiere',    'Thiere',                    10),
  (null, 'couscous_thiere',    'Sankhal',                   20),
  (null, 'couscous_thiere',    'Couscous',                  30),
  (null, 'attieke',            'Athieke',                   10),
  (null, 'attieke',            'Attieke',                   20),
  (null, 'farine_patissiere',  'Farine patissier',          10),
  (null, 'farine_patissiere',  'Farine patissiere',         20),
  (null, 'farine_patissiere',  'Farine',                    90),
  (null, 'farine_ble',         'Farine de ble',             10),
  (null, 'farine_ble',         'Farine boulangere',         20),
  (null, 'pain_arabe',         'Pain arabe',                10),
  (null, 'pain_arabe',         'Pain libanais',             20),
  (null, 'pain_burger',        'Pain burger',               10),
  (null, 'pain_burger',        'Pain hamburger',            20),
  (null, 'pain_burger',        'Buns',                      30),
  (null, 'tacos_galette',      'Tacos',                     10),
  (null, 'tacos_galette',      'Galette tacos',             20),

  -- Viandes, volailles, poissons
  (null, 'viande_boeuf_os',    'Viande locale',             10),
  (null, 'viande_boeuf_os',    'Viande de boeuf',           20),
  (null, 'viande_boeuf_os',    'Boeuf',                     30),
  (null, 'viande_boeuf_os',    'Viande',                    90),
  (null, 'viande_hachee',      'Viande hachee',             10),
  (null, 'poulet',             'Poulet blanc',              10),
  (null, 'poulet',             'Poulets',                   20),
  (null, 'poulet',             'Poulet',                    90),
  (null, 'poisson_entier',     'Poisson gm',                10),
  (null, 'poisson_entier',     'Poisson dorade',            20),
  (null, 'poisson_entier',     'Poisson lotte',             30),
  (null, 'poisson_entier',     'Poisson',                   90),
  (null, 'poisson_frire',      'Poisson frire',             10),
  (null, 'capitaine',          'Capitaine',                 10),
  (null, 'jambon',             'Jambon',                    10),
  (null, 'saucisson',          'Saucisson',                 10),
  (null, 'thon',               'Thon',                      10),
  (null, 'calamar',            'Calamar',                   10),
  (null, 'crevette',           'Crevette n 1',              10),
  (null, 'crevette',           'Crevette n 2',              20),
  (null, 'crevette',           'Crevette',                  90),
  (null, 'oeuf',               'Oeuf',                      10),
  (null, 'oeuf',               'Oeufs',                     20),

  -- Poissons s\xE9ch\xE9s et condiments s\xE9n\xE9galais
  (null, 'yet',                'Yet',                       10),
  (null, 'yet',                'Yet bou sew',               20),
  (null, 'guedj',              'Guedj beurre',              10),
  (null, 'guedj',              'Guedj kong',                20),
  (null, 'guedj',              'Guedj',                     90),
  (null, 'kong_fume',          'Kong fume',                 10),
  (null, 'crevette_sechee',    'Crevette sechee',           10),
  (null, 'netetou',            'Netetou en poudre',         10),
  (null, 'netetou',            'Netetou',                   20),
  (null, 'pagne',              'Pagne',                     10),
  (null, 'keithia',            'Keithia',                   10),

  -- L\xE9gumes et fruits
  (null, 'oignon',             'Oignon locale',             10),
  (null, 'oignon',             'Oignon blanc',              20),
  (null, 'oignon',             'Oignon',                    90),
  (null, 'oignon_vert',        'Oignon vert',               10),
  (null, 'tomate_fraiche',     'Tomate fraiche',            10),
  (null, 'tomate_fraiche',     'Tomate',                    90),
  (null, 'tomate_concentree',  'Tomate concentree',         10),
  (null, 'tomate_concentree',  'Concentre de tomate',       20),
  (null, 'tomate_concentree',  'Double concentre de tomate',30),
  (null, 'carotte',            'Carotte',                   10),
  (null, 'chou',               'Chou',                      10),
  (null, 'manioc',             'Manioc',                    10),
  (null, 'pomme_de_terre',     'Pomme de terre',            10),
  (null, 'pomme_de_terre',     'Pommes de terre',           20),
  (null, 'patate_douce',       'Patate',                    10),
  (null, 'patate_douce',       'Patate douce',              20),
  (null, 'gombo',              'Gombon',                    10),
  (null, 'gombo',              'Gombo',                     20),
  (null, 'aubergine_amere',    'Diakhatou',                 10),
  (null, 'aubergine_amere',    'Aubergine amere',           20),
  (null, 'poivron_vert',       'Poivron vert',              10),
  (null, 'poivron_vert',       'Poivron',                   90),
  (null, 'piment_frais',       'Piment gouana sofia',       10),
  (null, 'piment_frais',       'Piment frais',              20),
  (null, 'piment_frais',       'Piment',                    90),
  (null, 'piment_poudre',      'Piment en poudre',          10),
  (null, 'ail',                'Ail',                       10),
  (null, 'persil',             'Peril ordinnaire',          10),
  (null, 'persil',             'Persil',                    90),
  (null, 'coriandre',          'Persil chinois',            10),
  (null, 'coriandre',          'Coriandre',                 20),
  (null, 'salade',             'Salade',                    10),
  (null, 'salade',             'Laitue',                    20),
  (null, 'concombre',          'Concombre',                 10),
  (null, 'courgette',          'Courgette',                 10),
  (null, 'haricot_vert',       'Haricot vert',              10),
  (null, 'petit_pois',         'Petit pois',                10),
  (null, 'petit_pois',         'Petit bpois surgele',       20),
  (null, 'brocoli',            'Brocolis',                  10),
  (null, 'champignon',         'Champignon',                10),
  (null, 'olive_verte',        'Olive',                     10),
  (null, 'olive_noire',        'Olive noire gm',            10),
  (null, 'olive_noire',        'Olive noire',               20),
  (null, 'citron_vert',        'Citron vert',               10),
  (null, 'citron_liquide',     'Citron liquide',            10),
  (null, 'citron_liquide',     'Jus de citron',             20),
  (null, 'maicedoine',         'Maicedoine',                10),
  (null, 'maicedoine',         'Macedoine',                 20),
  (null, 'niebe',              'Niebe',                     10),
  (null, 'niebe',              'Haricot niebe',             20),
  (null, 'lentille',           'Lentille',                  10),
  (null, 'tamarin',            'Tamarin',                   10),
  (null, 'bissap',             'Bissap kouthia',            10),
  (null, 'bissap',             'Bissap',                    20),
  (null, 'bouye',              'Bouye',                     10),
  (null, 'noflaye',            'Noflaye',                   10),

  -- Mati\xE8res grasses (souvent absentes des catalogues : c'est voulu)
  (null, 'huile',              'Huile',                     10),
  (null, 'huile',              'Huile vegetale',            20),
  (null, 'huile',              'Huile de tournesol',        30),
  (null, 'huile',              'Huile d arachide',          40),
  (null, 'huile_palme',        'Huile de palme',            10),
  (null, 'huile_palme',        'Huile rouge',               20),
  (null, 'beurre',             'Beurre',                    10),
  (null, 'margarine',          'Margarine',                 10),

  -- Assaisonnements et sauces
  (null, 'sel',                'Sel grain',                 10),
  (null, 'sel',                'Sel fin',                   20),
  (null, 'sel',                'Sel',                       90),
  (null, 'poivre',             'Poivre moulu',              10),
  (null, 'poivre',             'Poivre noir',               20),
  (null, 'poivre',             'Poivre',                    90),
  (null, 'bouillon_cube',      'Maggi',                     10),
  (null, 'bouillon_cube',      'Bouillon cube',             20),
  (null, 'bouillon_cube',      'Jumbo',                     30),
  (null, 'bouillon_cube',      'Cube',                      40),
  (null, 'laurier',            'Laurier',                   10),
  (null, 'moutarde',           'Moutarde',                  10),
  (null, 'vinaigre',           'Vinaigre',                  10),
  (null, 'soja_sauce',         'Soja',                      10),
  (null, 'soja_sauce',         'Sauce soja',                20),
  (null, 'amora',              'Amora',                     10),
  (null, 'mayonnaise',         'Mayonnaise',                10),
  (null, 'ketchup',            'Ketchup',                   10),
  (null, 'sauce_chili',        'Sauce chili',               10),
  (null, 'sauce_algerienne',   'Sauce algerienne',          10),
  (null, 'curry',              'Epice curry',               10),
  (null, 'curry',              'Carry',                     20),
  (null, 'curry',              'Curry',                     30),
  (null, 'curcuma',            'Curcuman',                  10),
  (null, 'curcuma',            'Curcuma',                   20),
  (null, 'paprika',            'Epice paprika',             10),
  (null, 'paprika',            'Paprika',                   20),
  (null, 'thym',               'Epice thyn',                10),
  (null, 'thym',               'Thym',                      20),
  (null, 'herbes_provence',    'Herbe de province',         10),
  (null, 'herbes_provence',    'Herbes de provence',        20),
  (null, 'tandoori',           'Tandori',                   10),
  (null, 'tandoori',           'Tandoori',                  20),
  (null, 'pate_arachide',      'Pate d arachide',           10),
  (null, 'pate_arachide',      'Pate d arachide pure',      20),

  -- P\xE2tisserie, laitages, boissons
  (null, 'sucre',              'Sucre en poudre',           10),
  (null, 'sucre',              'Sucre',                     90),
  (null, 'sucre_morceaux',     'Sucre en morceaux',         10),
  (null, 'lait_poudre',        'Lait en poudre',            10),
  (null, 'lait_poudre',        'Lait poudre',               20),
  (null, 'lait_frais',         'Lait frais',                10),
  (null, 'lait_frais',         'Lait',                      90),
  (null, 'creme_liquide',      'Creme liquide',             10),
  (null, 'creme_liquide',      'Creme fraiche',             20),
  (null, 'fromage_rape',       'Fromage rape',              10),
  (null, 'fromage_rape',       'Mozzarella',                20),
  (null, 'fromage_rape',       'Fromage',                   90),
  (null, 'levure',             'Levure boulangere',         10),
  (null, 'levure',             'Levure chimique',           20),
  (null, 'levure',             'Levure',                    90),
  (null, 'vanille',            'Essence vanille',           10),
  (null, 'vanille',            'Extrait de vanille',        20),
  (null, 'vanille',            'Vanille',                   90),
  (null, 'essence_menthe',     'Essence menthe',            10),
  (null, 'fleur_oranger',      'Fleur d orange',            10),
  (null, 'fleur_oranger',      'Eau de fleur d oranger',    20),
  (null, 'chocolat',           'Chocolat patissier',        10),
  (null, 'chocolat',           'Chocolat noir',             20),
  (null, 'chocolat',           'Chocolat',                  90),
  (null, 'cacao',             'Cacao en poudre',            10),
  (null, 'cacao',             'Cacao',                      20),
  (null, 'cafe',               'Cafe moulu',                10),
  (null, 'cafe',               'Cafe',                      90),
  (null, 'the_vert',           'Ataya',                     10),
  (null, 'the_vert',           'The vert',                  20),
  (null, 'sunquick',           'Sunquick',                  10),

  -- Emballages : en fast-food, l'emballage est un co\xFBt par pi\xE8ce, pas un
  -- frais g\xE9n\xE9ral. Il a donc sa place dans la fiche technique.
  (null, 'carton_pizza',       'Carton pizza',              10),
  (null, 'pot_pizza',          'Pot pizza gobelets',        10),
  (null, 'papier_sandwich',    'Papier sandwich',           10),
  (null, 'sachet_emporte',     'Sachet emporte',            10),
  (null, 'sachet_croissant',   'Sachet croissant',          10),
  (null, 'pick_brochette',     'Pick brochette gm',         10),
  (null, 'pick_brochette',     'Pick brochette',            20),
  (null, 'gobelet',            'Gobelet cafe',              10),
  (null, 'gobelet',            'Gobelet',                   90),
  (null, 'charbon',            'Charbon',                   10)
on conflict on constraint uq_ingredient_alias do update
  set ingredient_key = excluded.ingredient_key,
      priority       = excluded.priority;


-- ---------------------------------------------------------------------
--  2. LES PLATS
-- ---------------------------------------------------------------------
insert into public.recipe_templates (organization_id, key, name, category, service, sort_order, steps, notes) values

  -- ---- Cuisine centrale : riz et plats s\xE9n\xE9galais ----
  (null, 'thiebou_dieune_rouge', 'Thi\xE9bou dieune rouge', 'Plat chaud', 'cuisine', 10,
   E'1. Nettoyer et farcir le poisson (ail, persil, piment).\\n'
   '2. Faire revenir l''oignon \xE0 l''huile, ajouter la tomate concentr\xE9e et cuire le concentr\xE9.\\n'
   '3. Mouiller, ajouter yet, guedj et n\xE9t\xE9tou ; cuire le poisson puis le r\xE9server.\\n'
   '4. Cuire les l\xE9gumes dans le bouillon, les r\xE9server au chaud.\\n'
   '5. Verser le riz lav\xE9 dans le bouillon, couvrir, cuire 25 \xE0 30 min \xE0 feu doux.\\n'
   '6. Dresser le riz, le poisson et les l\xE9gumes ; servir le piment \xE0 part.',
   'Plat unique : 150 g de riz sec par couvert. Le bouillon doit \xEAtre rectifi\xE9 AVANT le riz \u2014 '
   'apr\xE8s, le sel ne se reprend plus.'),

  (null, 'thiebou_dieune_blanc', 'Thi\xE9bou dieune blanc', 'Plat chaud', 'cuisine', 20,
   E'1. Nettoyer et farcir le poisson.\\n'
   '2. Monter un bouillon clair : oignon, huile, yet, guedj, n\xE9t\xE9tou, ail, persil.\\n'
   '3. Cuire le poisson, le r\xE9server ; cuire les l\xE9gumes dans le bouillon.\\n'
   '4. Cuire le riz dans le bouillon filtr\xE9, 25 \xE0 30 min.\\n'
   '5. Dresser ; citron et piment \xE0 part.',
   'Sans tomate concentr\xE9e : la couleur vient du bouillon, pas du concentr\xE9.'),

  (null, 'thiebou_yapp', 'Thi\xE9bou yapp (riz \xE0 la viande)', 'Plat chaud', 'cuisine', 30,
   E'1. Saisir la viande \xE0 l''huile avec l''ail et le poivre.\\n'
   '2. Ajouter l''oignon, puis la tomate concentr\xE9e ; cuire le concentr\xE9 5 min.\\n'
   '3. Mouiller, ajouter laurier et n\xE9t\xE9tou, mijoter 45 min.\\n'
   '4. Ajouter les l\xE9gumes, cuire 20 min, les r\xE9server.\\n'
   '5. Cuire le riz dans le bouillon, 25 min.\\n'
   '6. Dresser riz, viande et l\xE9gumes.',
   'Viande avec os : le poids inclut l''os, comme \xE0 l''achat.'),

  (null, 'thiebou_guinar', 'Thi\xE9bou guinar (riz au poulet)', 'Plat chaud', 'cuisine', 40,
   E'1. Assaisonner le poulet (ail, poivre, bouillon) et le saisir.\\n'
   '2. Faire revenir l''oignon, ajouter la tomate concentr\xE9e.\\n'
   '3. Mouiller, remettre le poulet, mijoter 30 min.\\n'
   '4. Cuire les l\xE9gumes dans le bouillon, r\xE9server.\\n'
   '5. Cuire le riz dans le bouillon, 25 min.',
   'Poulet d\xE9coup\xE9 en 8 : environ 200 g par couvert, os compris.'),

  (null, 'maffe_yapp', 'Maf\xE9 viande', 'Plat chaud', 'cuisine', 50,
   E'1. Couper la viande en morceaux, assaisonner (ail, poivre, bouillon).\\n'
   '2. Faire revenir \xE0 l''huile, ajouter l''oignon et la tomate concentr\xE9e.\\n'
   '3. D\xE9layer la p\xE2te d''arachide dans de l''eau chaude, verser et mouiller.\\n'
   '4. Mijoter 45 min \xE0 feu doux en remuant \u2014 la p\xE2te attache.\\n'
   '5. Ajouter pomme de terre, carotte et patate douce ; cuire 20 min.\\n'
   '6. Rectifier (yet, n\xE9t\xE9tou, piment) ; servir avec le riz cuit \xE0 part.',
   'La viande p\xE8se le plus lourd dans le co\xFBt mati\xE8re : surveiller le food cost de cette seule ligne. '
   'La p\xE2te d''arachide doit cuire au moins 40 min, sinon elle reste am\xE8re.'),

  (null, 'maffe_guinar', 'Maf\xE9 poulet', 'Plat chaud', 'cuisine', 60,
   E'1. Assaisonner et saisir le poulet.\\n'
   '2. Faire revenir l''oignon, ajouter la tomate concentr\xE9e.\\n'
   '3. D\xE9layer la p\xE2te d''arachide, verser, mouiller, mijoter 30 min.\\n'
   '4. Ajouter les l\xE9gumes, cuire 20 min.\\n'
   '5. Rectifier ; servir avec le riz.',
   'Moins long que le maf\xE9 viande : le poulet ne demande que 30 min.'),

  (null, 'yassa_poulet', 'Yassa poulet', 'Plat chaud', 'cuisine', 70,
   E'1. Mariner le poulet la veille : citron, oignon \xE9minc\xE9, moutarde, ail, piment.\\n'
   '2. Griller ou saisir le poulet, le r\xE9server.\\n'
   '3. Confire l''oignon de la marinade \xE0 l''huile, 30 min \xE0 feu doux, avec le laurier.\\n'
   '4. Ajouter un trait de vinaigre, remettre le poulet, mijoter 15 min.\\n'
   '5. Servir sur le riz blanc.',
   'Le yassa EST un plat d''oignon : 180 g par couvert, et l''oignon doit confire, pas frire. '
   'Marinade la veille \u2014 c''est elle qui fait le go\xFBt, pas la cuisson.'),

  (null, 'yassa_poisson', 'Yassa poisson', 'Plat chaud', 'cuisine', 80,
   E'1. Mariner le poisson 2 h : citron, moutarde, ail, piment.\\n'
   '2. Frire le poisson, le r\xE9server.\\n'
   '3. Confire l''oignon \xE0 l''huile 30 min avec le laurier et la marinade.\\n'
   '4. D\xE9glacer au vinaigre, remettre le poisson 5 min.\\n'
   '5. Servir sur le riz blanc.',
   'Le poisson ne retourne dans l''oignon qu''au dernier moment, sinon il se d\xE9fait.'),

  (null, 'domoda_viande', 'Domoda', 'Plat chaud', 'cuisine', 90,
   E'1. Saisir la viande, ajouter l''oignon puis la tomate concentr\xE9e.\\n'
   '2. Mouiller et mijoter 45 min.\\n'
   '3. D\xE9layer la farine \xE0 froid, verser en pluie pour lier la sauce.\\n'
   '4. Ajouter les l\xE9gumes, cuire 20 min.\\n'
   '5. Acidifier au citron en fin de cuisson ; servir avec le riz.',
   'La farine se d\xE9laie TOUJOURS \xE0 froid, sinon la sauce fait des grumeaux. '
   'L''acidit\xE9 du citron s''ajoute hors du feu.'),

  (null, 'soupou_kandia', 'Soupou kandia', 'Plat chaud', 'cuisine', 100,
   E'1. Hacher le gombo tr\xE8s fin (ou le r\xE2per).\\n'
   '2. Cuire poisson, crevettes s\xE9ch\xE9es, guedj et kong dans un bouillon court.\\n'
   '3. Ajouter le gombo et l''huile de palme ; cuire 30 min sans couvrir.\\n'
   '4. Rectifier (yet, n\xE9t\xE9tou, piment).\\n'
   '5. Servir sur le riz blanc.',
   'Sans huile de palme, ce n''est pas un soupou kandia. Ne jamais couvrir : le gombo noircit.'),

  (null, 'thiou_rouge', 'Thiou rouge', 'Plat chaud', 'cuisine', 110,
   E'1. Saisir la viande, ajouter l''oignon.\\n'
   '2. Cuire la tomate concentr\xE9e 5 min, mouiller largement.\\n'
   '3. Mijoter 45 min, ajouter les l\xE9gumes, cuire 25 min.\\n'
   '4. Rectifier ; servir la sauce et les l\xE9gumes sur le riz blanc.',
   'Sauce plus longue en bouche que le thi\xE9bou : le concentr\xE9 doit cuire, pas bouillir.'),

  (null, 'caldou', 'Caldou', 'Plat chaud', 'cuisine', 120,
   E'1. Monter un bouillon clair : oignon, poivron, ail, piment, huile.\\n'
   '2. Pocher le poisson 12 min dans ce bouillon.\\n'
   '3. Acidifier franchement au citron, hors du feu.\\n'
   '4. Servir avec le riz blanc.',
   'Sauce claire, jamais li\xE9e. Le citron s''ajoute hors du feu, sinon il devient amer.'),

  (null, 'ndambe', 'Ndamb\xE9', 'Plat chaud', 'cuisine', 130,
   E'1. Tremper le ni\xE9b\xE9 la veille, le cuire 1 h sans sel.\\n'
   '2. Faire revenir l''oignon, ajouter la tomate concentr\xE9e et l''huile.\\n'
   '3. R\xE9unir, saler, mijoter 20 min.\\n'
   '4. Servir en plat ou en garniture de pain.',
   'Le sel en d\xE9but de cuisson durcit le ni\xE9b\xE9 : saler \xE0 la fin. Plat le moins cher du r\xE9pertoire.'),

  (null, 'vermicelle_viande', 'Vermicelle \xE0 la viande', 'Plat chaud', 'cuisine', 140,
   E'1. Saisir la viande, ajouter l''oignon et la tomate concentr\xE9e.\\n'
   '2. Mouiller, mijoter 40 min.\\n'
   '3. Cuire le vermicelle \xE0 la vapeur ou dans le bouillon.\\n'
   '4. Ajouter carotte et petits pois.\\n'
   '5. R\xE9unir au service.',
   'Le vermicelle gonfle : 120 g sec par couvert suffisent.'),

  (null, 'spaghetti_bolognaise', 'Spaghetti bolognaise', 'Plat chaud', 'cuisine', 150,
   E'1. Faire revenir la viande hach\xE9e \xE0 l''huile, l''\xE9grener.\\n'
   '2. Ajouter oignon, ail et carotte en brunoise.\\n'
   '3. Ajouter tomate fra\xEEche et concentr\xE9, herbes et paprika ; mijoter 30 min.\\n'
   '4. Cuire les spaghetti al dente.\\n'
   '5. Napper au service, jamais \xE0 l''avance.',
   'Napper au service : des p\xE2tes m\xE9lang\xE9es \xE0 la sauce \xE0 l''avance se d\xE9litent.'),

  (null, 'poisson_firire', 'Poisson frit (firire) et oignons', 'Plat chaud', 'cuisine', 160,
   E'1. Mariner le poisson (ail, citron, piment, sel).\\n'
   '2. Le frire \xE0 l''huile chaude, l''\xE9goutter.\\n'
   '3. Confire l''oignon avec un peu de tomate concentr\xE9e et de moutarde.\\n'
   '4. Servir avec le riz blanc et l''oignon \xE0 part.',
   'Huile de friture : compter la consommation r\xE9elle, pas le volume du bain.'),

  -- ---- Fast food : une portion = une pi\xE8ce vendue ----
  (null, 'burger_boeuf', 'Hamburger b\u0153uf', 'Fast food', 'fast_food', 200,
   E'1. Fa\xE7onner le steak (120 g), assaisonner au dernier moment.\\n'
   '2. Griller 2 min par face, toaster le pain.\\n'
   '3. Monter : sauce, salade, tomate, steak, oignon, sauce.\\n'
   '4. Emballer imm\xE9diatement.',
   'Une portion = un burger. Assaisonner le steak avant la cuisson le fait rendre son eau.'),

  (null, 'chawarma_poulet', 'Chawarma poulet', 'Fast food', 'fast_food', 210,
   E'1. Mariner le poulet \xE9minc\xE9 (curry, paprika, ail, citron) 2 h.\\n'
   '2. Le saisir \xE0 feu vif \xE0 la plancha.\\n'
   '3. Garnir le pain : sauces, crudit\xE9s, poulet.\\n'
   '4. Rouler serr\xE9, passer au grill 1 min.',
   'Une portion = un chawarma. Le pain se garnit chaud, sinon il casse en roulant.'),

  (null, 'pizza_margherita', 'Pizza margherita', 'Fast food', 'fast_food', 220,
   E'1. P\xE9trir la p\xE2te (farine, eau, levure, sel, huile), laisser pousser 1 h 30.\\n'
   '2. Abaisser \xE0 28 cm, garnir de sauce tomate.\\n'
   '3. Ajouter le fromage et les herbes.\\n'
   '4. Cuire 8 \xE0 10 min \xE0 four tr\xE8s chaud.',
   'Une portion = une pizza de 28 cm. La p\xE2te doit pousser : une pizza press\xE9e est une pizza dure.'),

  (null, 'pizza_reine', 'Pizza reine', 'Fast food', 'fast_food', 230,
   E'1. Pr\xE9parer et pousser la p\xE2te.\\n'
   '2. Garnir : sauce tomate, fromage, jambon, champignons, olives.\\n'
   '3. Cuire 8 \xE0 10 min \xE0 four tr\xE8s chaud.',
   'Une portion = une pizza de 28 cm.'),

  (null, 'tacos_poulet', 'Tacos poulet', 'Fast food', 'fast_food', 240,
   E'1. Saisir le poulet marin\xE9, frire les pommes de terre en b\xE2tonnets.\\n'
   '2. Garnir la galette : sauce, poulet, frites, fromage.\\n'
   '3. Plier en rectangle, presser au grill 2 min par face.',
   'Une portion = un tacos. Presser au grill soude la galette : sans cela, il s''ouvre.'),

  (null, 'sandwich_thon', 'Sandwich thon', 'Fast food', 'fast_food', 250,
   E'1. \xC9goutter le thon, le lier \xE0 la mayonnaise et au citron.\\n'
   '2. Garnir le pain : crudit\xE9s, thon, olives.\\n'
   '3. Emballer.',
   'Une portion = un sandwich. Thon mal \xE9goutt\xE9 = pain d\xE9tremp\xE9 en dix minutes.'),

  (null, 'brochette_boeuf', 'Brochette de b\u0153uf', 'Fast food', 'fast_food', 260,
   E'1. D\xE9tailler la viande en cubes de 25 g, mariner (moutarde, ail, paprika, huile).\\n'
   '2. Monter en alternant viande, oignon et poivron.\\n'
   '3. Griller 3 min par face sur braise vive.',
   'Une portion = une brochette. Prendre un morceau sans os : le poids d''achat de la viande avec os '
   'ne donne pas le poids embroch\xE9.'),

  (null, 'poulet_frit_frites', 'Poulet frit et frites', 'Fast food', 'fast_food', 270,
   E'1. Mariner le poulet (paprika, curry, ail, sel) 2 h.\\n'
   '2. Le fariner, frire 12 min \xE0 170 \xB0C.\\n'
   '3. Frire les pommes de terre en deux bains.\\n'
   '4. Dresser, ketchup \xE0 part.',
   'Une portion = un quart de poulet et sa garniture.'),

  -- ---- P\xE2tisserie : une portion = une pi\xE8ce ou une part ----
  (null, 'croissant', 'Croissant', 'P\xE2tisserie', 'patisserie', 300,
   E'1. P\xE9trir la d\xE9trempe, la laisser reposer au froid 1 h.\\n'
   '2. Incorporer le beurre, donner 3 tours simples avec repos au froid.\\n'
   '3. D\xE9tailler les triangles, rouler, laisser pousser 1 h 30.\\n'
   '4. Dorer \xE0 l''\u0153uf, cuire 15 min \xE0 190 \xB0C.',
   'Une portion = un croissant d''environ 60 g. Le beurre est le poste de co\xFBt dominant : '
   'un croissant sans beurre de tourage n''est pas un croissant.'),

  (null, 'pain_chocolat', 'Pain au chocolat', 'P\xE2tisserie', 'patisserie', 310,
   E'1. M\xEAme p\xE2te lev\xE9e feuillet\xE9e que le croissant.\\n'
   '2. D\xE9tailler des rectangles, poser deux barres de chocolat, rouler.\\n'
   '3. Pousser 1 h 30, dorer, cuire 15 min \xE0 190 \xB0C.',
   'Une portion = une pi\xE8ce. M\xEAme p\xE2te que le croissant : mutualiser le tourage.'),

  (null, 'cake_nature', 'Cake nature', 'P\xE2tisserie', 'patisserie', 320,
   E'1. Cr\xE9mer beurre et sucre, ajouter les \u0153ufs un \xE0 un.\\n'
   '2. Incorporer farine et levure tamis\xE9es, puis le lait et la vanille.\\n'
   '3. Cuire 45 min \xE0 160 \xB0C en moule \xE0 cake.\\n'
   '4. Laisser refroidir avant de trancher.',
   'Une portion = une part. Trancher ti\xE8de \xE9crase la mie.'),

  (null, 'beignet_sucre', 'Beignet sucr\xE9', 'P\xE2tisserie', 'patisserie', 330,
   E'1. P\xE9trir une p\xE2te lev\xE9e souple, pousser 1 h.\\n'
   '2. D\xE9tailler, laisser d\xE9tendre 20 min.\\n'
   '3. Frire 2 min par face \xE0 170 \xB0C.\\n'
   '4. Rouler dans le sucre \xE0 la sortie.',
   'Une portion = une pi\xE8ce. Le sucre s''applique chaud, sinon il n''adh\xE8re pas.'),

  (null, 'gateau_chocolat', 'G\xE2teau au chocolat', 'P\xE2tisserie', 'patisserie', 340,
   E'1. Fondre chocolat et beurre au bain-marie.\\n'
   '2. Blanchir \u0153ufs et sucre, r\xE9unir.\\n'
   '3. Incorporer farine, cacao et levure tamis\xE9s.\\n'
   '4. Cuire 25 min \xE0 170 \xB0C \u2014 c\u0153ur encore souple.',
   'Une portion = une part. Trop cuit, il devient sec : sortir quand le centre tremble encore.'),

  -- ---- Petit d\xE9jeuner ----
  (null, 'omelette_legumes', 'Omelette aux l\xE9gumes', 'Petit d\xE9jeuner', 'petit_dejeuner', 400,
   E'1. Suer oignon, poivron et tomate \xE0 l''huile.\\n'
   '2. Battre les \u0153ufs, saler, poivrer, ajouter le persil.\\n'
   '3. Verser sur la garniture, cuire \xE0 feu doux 4 min.\\n'
   '4. Plier et servir aussit\xF4t.',
   'Une portion = deux \u0153ufs. \xC0 feu doux : une omelette saisie devient caoutchouteuse.'),

  (null, 'cafe_au_lait', 'Caf\xE9 au lait', 'Petit d\xE9jeuner', 'petit_dejeuner', 410,
   E'1. Pr\xE9parer le caf\xE9.\\n'
   '2. D\xE9layer le lait en poudre dans un peu d''eau chaude, compl\xE9ter.\\n'
   '3. Sucrer et servir br\xFBlant.',
   'Une portion = une tasse de 20 cl. Le gobelet compte dans le co\xFBt d''une vente \xE0 emporter.'),

  (null, 'bouillie_bouye', 'Bouillie au bouye (lakh)', 'Petit d\xE9jeuner', 'petit_dejeuner', 420,
   E'1. Cuire le couscous de mil \xE0 la vapeur, 2 passages.\\n'
   '2. D\xE9layer la pulpe de bouye, la tamiser.\\n'
   '3. R\xE9unir avec le lait et le sucre, parfumer \xE0 la vanille.\\n'
   '4. Servir frais ou ti\xE8de.',
   'Une portion = un bol. Tamiser le bouye : les fibres passent mal au service.')

on conflict on constraint uq_recipe_templates_key do update
  set name       = excluded.name,
      category   = excluded.category,
      service    = excluded.service,
      sort_order = excluded.sort_order,
      steps      = excluded.steps,
      notes      = excluded.notes;


-- ---------------------------------------------------------------------
--  3. LES LIGNES \u2014 quantit\xE9 NETTE par portion, et perte au parage
--
--  Le brut sorti du magasin vaut net / (1 \u2212 perte). Les pertes retenues
--  sont les pertes de m\xE9tier : oignon 10 %, carotte 12 %, chou 12 %,
--  ail 15 %, pomme de terre et patate 20 %, manioc 25 %, poisson entier
--  20 % (\xE9caillage et vidage).
-- ---------------------------------------------------------------------
insert into public.recipe_template_lines
  (template_id, ingredient_key, quantity_per_portion, unit_code, loss_pct, role, is_optional, position, note)
select t.id, d.ikey, d.qty, d.unit, d.loss, d.irole, d.opt, d.pos, d.note
  from (values
    -- Thi\xE9bou dieune rouge
    ('thiebou_dieune_rouge', 'riz_brise',         150::numeric, 'g',  0::numeric, 'base',           false, 1,  null::text),
    ('thiebou_dieune_rouge', 'poisson_entier',    180, 'g', 20, 'proteine',       false, 2,  'Dorade, capitaine ou lotte selon le march\xE9'),
    ('thiebou_dieune_rouge', 'tomate_concentree',  25, 'g',  0, 'assaisonnement', false, 3,  null),
    ('thiebou_dieune_rouge', 'oignon',             50, 'g', 10, 'legume',         false, 4,  null),
    ('thiebou_dieune_rouge', 'huile',              25, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('thiebou_dieune_rouge', 'chou',               60, 'g', 12, 'legume',         false, 6,  null),
    ('thiebou_dieune_rouge', 'carotte',            50, 'g', 12, 'legume',         false, 7,  null),
    ('thiebou_dieune_rouge', 'manioc',             50, 'g', 25, 'legume',         false, 8,  null),
    ('thiebou_dieune_rouge', 'patate_douce',       40, 'g', 20, 'legume',         false, 9,  null),
    ('thiebou_dieune_rouge', 'aubergine_amere',    30, 'g', 10, 'legume',         true,  10, 'Diakhatou, si la saison le permet'),
    ('thiebou_dieune_rouge', 'gombo',              20, 'g',  5, 'legume',         true,  11, null),
    ('thiebou_dieune_rouge', 'ail',                 3, 'g', 15, 'assaisonnement', false, 12, null),
    ('thiebou_dieune_rouge', 'persil',              5, 'g',  0, 'assaisonnement', false, 13, null),
    ('thiebou_dieune_rouge', 'yet',                 2, 'g',  0, 'assaisonnement', false, 14, null),
    ('thiebou_dieune_rouge', 'guedj',               5, 'g',  0, 'assaisonnement', false, 15, null),
    ('thiebou_dieune_rouge', 'netetou',             2, 'g',  0, 'assaisonnement', false, 16, null),
    ('thiebou_dieune_rouge', 'tamarin',             3, 'g',  0, 'assaisonnement', true,  17, null),
    ('thiebou_dieune_rouge', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 18, 'Servi \xE0 part'),
    ('thiebou_dieune_rouge', 'sel',                 4, 'g',  0, 'assaisonnement', false, 19, null),
    ('thiebou_dieune_rouge', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 20, null),
    ('thiebou_dieune_rouge', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 21, null),

    -- Thi\xE9bou dieune blanc
    ('thiebou_dieune_blanc', 'riz_brise',         150, 'g',  0, 'base',           false, 1,  null),
    ('thiebou_dieune_blanc', 'poisson_entier',    180, 'g', 20, 'proteine',       false, 2,  null),
    ('thiebou_dieune_blanc', 'oignon',             40, 'g', 10, 'legume',         false, 3,  null),
    ('thiebou_dieune_blanc', 'huile',              25, 'ml', 0, 'matiere_grasse', false, 4,  null),
    ('thiebou_dieune_blanc', 'chou',               60, 'g', 12, 'legume',         false, 5,  null),
    ('thiebou_dieune_blanc', 'carotte',            50, 'g', 12, 'legume',         false, 6,  null),
    ('thiebou_dieune_blanc', 'manioc',             50, 'g', 25, 'legume',         false, 7,  null),
    ('thiebou_dieune_blanc', 'patate_douce',       40, 'g', 20, 'legume',         false, 8,  null),
    ('thiebou_dieune_blanc', 'gombo',              20, 'g',  5, 'legume',         true,  9,  null),
    ('thiebou_dieune_blanc', 'citron_vert',        10, 'g',  0, 'assaisonnement', false, 10, null),
    ('thiebou_dieune_blanc', 'ail',                 3, 'g', 15, 'assaisonnement', false, 11, null),
    ('thiebou_dieune_blanc', 'persil',              5, 'g',  0, 'assaisonnement', false, 12, null),
    ('thiebou_dieune_blanc', 'yet',                 2, 'g',  0, 'assaisonnement', false, 13, null),
    ('thiebou_dieune_blanc', 'guedj',               5, 'g',  0, 'assaisonnement', false, 14, null),
    ('thiebou_dieune_blanc', 'netetou',             2, 'g',  0, 'assaisonnement', false, 15, null),
    ('thiebou_dieune_blanc', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 16, null),
    ('thiebou_dieune_blanc', 'sel',                 4, 'g',  0, 'assaisonnement', false, 17, null),
    ('thiebou_dieune_blanc', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 18, null),
    ('thiebou_dieune_blanc', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 19, null),

    -- Thi\xE9bou yapp
    ('thiebou_yapp', 'riz_brise',         150, 'g',  0, 'base',           false, 1,  null),
    ('thiebou_yapp', 'viande_boeuf_os',   150, 'g',  0, 'proteine',       false, 2,  'Poids avec os, comme \xE0 l''achat'),
    ('thiebou_yapp', 'tomate_concentree',  20, 'g',  0, 'assaisonnement', false, 3,  null),
    ('thiebou_yapp', 'oignon',             60, 'g', 10, 'legume',         false, 4,  null),
    ('thiebou_yapp', 'huile',              25, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('thiebou_yapp', 'carotte',            40, 'g', 12, 'legume',         false, 6,  null),
    ('thiebou_yapp', 'chou',               50, 'g', 12, 'legume',         false, 7,  null),
    ('thiebou_yapp', 'pomme_de_terre',     50, 'g', 20, 'legume',         false, 8,  null),
    ('thiebou_yapp', 'ail',                 3, 'g', 15, 'assaisonnement', false, 9,  null),
    ('thiebou_yapp', 'laurier',           0.3, 'g',  0, 'assaisonnement', false, 10, null),
    ('thiebou_yapp', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 11, null),
    ('thiebou_yapp', 'netetou',             1, 'g',  0, 'assaisonnement', false, 12, null),
    ('thiebou_yapp', 'sel',                 4, 'g',  0, 'assaisonnement', false, 13, null),
    ('thiebou_yapp', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 14, null),
    ('thiebou_yapp', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 15, null),

    -- Thi\xE9bou guinar
    ('thiebou_guinar', 'riz_brise',         150, 'g',  0, 'base',           false, 1,  null),
    ('thiebou_guinar', 'poulet',            200, 'g',  0, 'proteine',       false, 2,  'D\xE9coupe en 8'),
    ('thiebou_guinar', 'tomate_concentree',  20, 'g',  0, 'assaisonnement', false, 3,  null),
    ('thiebou_guinar', 'oignon',             60, 'g', 10, 'legume',         false, 4,  null),
    ('thiebou_guinar', 'huile',              25, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('thiebou_guinar', 'carotte',            40, 'g', 12, 'legume',         false, 6,  null),
    ('thiebou_guinar', 'chou',               50, 'g', 12, 'legume',         false, 7,  null),
    ('thiebou_guinar', 'pomme_de_terre',     50, 'g', 20, 'legume',         false, 8,  null),
    ('thiebou_guinar', 'poivron_vert',       15, 'g',  8, 'legume',         false, 9,  null),
    ('thiebou_guinar', 'ail',                 3, 'g', 15, 'assaisonnement', false, 10, null),
    ('thiebou_guinar', 'laurier',           0.3, 'g',  0, 'assaisonnement', false, 11, null),
    ('thiebou_guinar', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 12, null),
    ('thiebou_guinar', 'sel',                 4, 'g',  0, 'assaisonnement', false, 13, null),
    ('thiebou_guinar', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 14, null),
    ('thiebou_guinar', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 15, null),

    -- Maf\xE9 viande
    ('maffe_yapp', 'viande_boeuf_os',   150, 'g',  0, 'proteine',       false, 1,  'Poids avec os'),
    ('maffe_yapp', 'pate_arachide',      30, 'g',  0, 'base',           false, 2,  null),
    ('maffe_yapp', 'oignon',             40, 'g', 10, 'legume',         false, 3,  null),
    ('maffe_yapp', 'tomate_concentree',  15, 'g',  0, 'assaisonnement', false, 4,  null),
    ('maffe_yapp', 'huile',              15, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('maffe_yapp', 'pomme_de_terre',     50, 'g', 20, 'legume',         false, 6,  null),
    ('maffe_yapp', 'carotte',            30, 'g', 12, 'legume',         false, 7,  null),
    ('maffe_yapp', 'patate_douce',       30, 'g', 20, 'legume',         false, 8,  null),
    ('maffe_yapp', 'ail',                 3, 'g', 15, 'assaisonnement', false, 9,  null),
    ('maffe_yapp', 'laurier',           0.3, 'g',  0, 'assaisonnement', false, 10, null),
    ('maffe_yapp', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 11, null),
    ('maffe_yapp', 'netetou',             1, 'g',  0, 'assaisonnement', false, 12, null),
    ('maffe_yapp', 'yet',                 1, 'g',  0, 'assaisonnement', true,  13, null),
    ('maffe_yapp', 'sel',                 3, 'g',  0, 'assaisonnement', false, 14, null),
    ('maffe_yapp', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 15, null),
    ('maffe_yapp', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 16, null),
    ('maffe_yapp', 'riz_brise',         150, 'g',  0, 'accompagnement', false, 17, 'Cuit \xE0 part'),

    -- Maf\xE9 poulet
    ('maffe_guinar', 'poulet',            200, 'g',  0, 'proteine',       false, 1,  null),
    ('maffe_guinar', 'pate_arachide',      30, 'g',  0, 'base',           false, 2,  null),
    ('maffe_guinar', 'oignon',             40, 'g', 10, 'legume',         false, 3,  null),
    ('maffe_guinar', 'tomate_concentree',  15, 'g',  0, 'assaisonnement', false, 4,  null),
    ('maffe_guinar', 'huile',              15, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('maffe_guinar', 'pomme_de_terre',     50, 'g', 20, 'legume',         false, 6,  null),
    ('maffe_guinar', 'carotte',            30, 'g', 12, 'legume',         false, 7,  null),
    ('maffe_guinar', 'patate_douce',       30, 'g', 20, 'legume',         false, 8,  null),
    ('maffe_guinar', 'ail',                 3, 'g', 15, 'assaisonnement', false, 9,  null),
    ('maffe_guinar', 'laurier',           0.3, 'g',  0, 'assaisonnement', false, 10, null),
    ('maffe_guinar', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 11, null),
    ('maffe_guinar', 'sel',                 3, 'g',  0, 'assaisonnement', false, 12, null),
    ('maffe_guinar', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 13, null),
    ('maffe_guinar', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 14, null),
    ('maffe_guinar', 'riz_brise',         150, 'g',  0, 'accompagnement', false, 15, 'Cuit \xE0 part'),

    -- Yassa poulet
    ('yassa_poulet', 'poulet',         200, 'g',  0, 'proteine',       false, 1,  null),
    ('yassa_poulet', 'oignon',         180, 'g', 10, 'base',           false, 2,  'Le plat EST un plat d''oignon'),
    ('yassa_poulet', 'huile',           25, 'ml', 0, 'matiere_grasse', false, 3,  null),
    ('yassa_poulet', 'moutarde',        10, 'g',  0, 'assaisonnement', false, 4,  null),
    ('yassa_poulet', 'citron_vert',     20, 'g',  0, 'assaisonnement', false, 5,  null),
    ('yassa_poulet', 'vinaigre',         5, 'ml', 0, 'assaisonnement', false, 6,  null),
    ('yassa_poulet', 'poivron_vert',    15, 'g',  8, 'legume',         true,  7,  null),
    ('yassa_poulet', 'laurier',        0.3, 'g',  0, 'assaisonnement', false, 8,  null),
    ('yassa_poulet', 'ail',              3, 'g', 15, 'assaisonnement', false, 9,  null),
    ('yassa_poulet', 'piment_frais',     2, 'g',  0, 'assaisonnement', false, 10, null),
    ('yassa_poulet', 'sel',              3, 'g',  0, 'assaisonnement', false, 11, null),
    ('yassa_poulet', 'bouillon_cube',    2, 'g',  0, 'assaisonnement', false, 12, null),
    ('yassa_poulet', 'poivre',         0.3, 'g',  0, 'assaisonnement', false, 13, null),
    ('yassa_poulet', 'riz_brise',      150, 'g',  0, 'accompagnement', false, 14, null),

    -- Yassa poisson
    ('yassa_poisson', 'poisson_entier', 180, 'g', 20, 'proteine',       false, 1,  null),
    ('yassa_poisson', 'oignon',         180, 'g', 10, 'base',           false, 2,  null),
    ('yassa_poisson', 'huile',           25, 'ml', 0, 'matiere_grasse', false, 3,  null),
    ('yassa_poisson', 'moutarde',        10, 'g',  0, 'assaisonnement', false, 4,  null),
    ('yassa_poisson', 'citron_vert',     20, 'g',  0, 'assaisonnement', false, 5,  null),
    ('yassa_poisson', 'vinaigre',         5, 'ml', 0, 'assaisonnement', false, 6,  null),
    ('yassa_poisson', 'laurier',        0.3, 'g',  0, 'assaisonnement', false, 7,  null),
    ('yassa_poisson', 'ail',              3, 'g', 15, 'assaisonnement', false, 8,  null),
    ('yassa_poisson', 'piment_frais',     2, 'g',  0, 'assaisonnement', false, 9,  null),
    ('yassa_poisson', 'sel',              3, 'g',  0, 'assaisonnement', false, 10, null),
    ('yassa_poisson', 'bouillon_cube',    2, 'g',  0, 'assaisonnement', false, 11, null),
    ('yassa_poisson', 'poivre',         0.3, 'g',  0, 'assaisonnement', false, 12, null),
    ('yassa_poisson', 'riz_brise',      150, 'g',  0, 'accompagnement', false, 13, null),

    -- Domoda
    ('domoda_viande', 'viande_boeuf_os',    150, 'g',  0, 'proteine',       false, 1,  null),
    ('domoda_viande', 'farine_patissiere',   20, 'g',  0, 'base',           false, 2,  'Liaison, d\xE9lay\xE9e \xE0 froid'),
    ('domoda_viande', 'tomate_concentree',   15, 'g',  0, 'assaisonnement', false, 3,  null),
    ('domoda_viande', 'oignon',              40, 'g', 10, 'legume',         false, 4,  null),
    ('domoda_viande', 'huile',               15, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('domoda_viande', 'citron_vert',         15, 'g',  0, 'assaisonnement', false, 6,  null),
    ('domoda_viande', 'pomme_de_terre',      50, 'g', 20, 'legume',         false, 7,  null),
    ('domoda_viande', 'carotte',             30, 'g', 12, 'legume',         false, 8,  null),
    ('domoda_viande', 'ail',                  3, 'g', 15, 'assaisonnement', false, 9,  null),
    ('domoda_viande', 'piment_frais',         2, 'g',  0, 'assaisonnement', false, 10, null),
    ('domoda_viande', 'sel',                  3, 'g',  0, 'assaisonnement', false, 11, null),
    ('domoda_viande', 'bouillon_cube',        2, 'g',  0, 'assaisonnement', false, 12, null),
    ('domoda_viande', 'poivre',             0.3, 'g',  0, 'assaisonnement', false, 13, null),
    ('domoda_viande', 'riz_brise',          150, 'g',  0, 'accompagnement', false, 14, null),

    -- Soupou kandia
    ('soupou_kandia', 'gombo',           120, 'g',  5, 'base',           false, 1,  'Hach\xE9 tr\xE8s fin ou r\xE2p\xE9'),
    ('soupou_kandia', 'poisson_entier',  150, 'g', 20, 'proteine',       false, 2,  null),
    ('soupou_kandia', 'huile_palme',      40, 'ml', 0, 'matiere_grasse', false, 3,  'Indispensable au plat'),
    ('soupou_kandia', 'crevette_sechee',  10, 'g',  0, 'proteine',       false, 4,  null),
    ('soupou_kandia', 'guedj',            10, 'g',  0, 'assaisonnement', false, 5,  null),
    ('soupou_kandia', 'kong_fume',        15, 'g',  0, 'proteine',       false, 6,  null),
    ('soupou_kandia', 'oignon',           20, 'g', 10, 'legume',         false, 7,  null),
    ('soupou_kandia', 'yet',               2, 'g',  0, 'assaisonnement', false, 8,  null),
    ('soupou_kandia', 'netetou',           2, 'g',  0, 'assaisonnement', false, 9,  null),
    ('soupou_kandia', 'piment_frais',      3, 'g',  0, 'assaisonnement', false, 10, null),
    ('soupou_kandia', 'sel',               3, 'g',  0, 'assaisonnement', false, 11, null),
    ('soupou_kandia', 'bouillon_cube',     2, 'g',  0, 'assaisonnement', false, 12, null),
    ('soupou_kandia', 'riz_brise',       150, 'g',  0, 'accompagnement', false, 13, null),

    -- Thiou rouge
    ('thiou_rouge', 'viande_boeuf_os',   140, 'g',  0, 'proteine',       false, 1,  null),
    ('thiou_rouge', 'tomate_concentree',  25, 'g',  0, 'base',           false, 2,  null),
    ('thiou_rouge', 'oignon',             50, 'g', 10, 'legume',         false, 3,  null),
    ('thiou_rouge', 'huile',              20, 'ml', 0, 'matiere_grasse', false, 4,  null),
    ('thiou_rouge', 'chou',               60, 'g', 12, 'legume',         false, 5,  null),
    ('thiou_rouge', 'carotte',            50, 'g', 12, 'legume',         false, 6,  null),
    ('thiou_rouge', 'pomme_de_terre',     60, 'g', 20, 'legume',         false, 7,  null),
    ('thiou_rouge', 'aubergine_amere',    30, 'g', 10, 'legume',         true,  8,  null),
    ('thiou_rouge', 'ail',                 3, 'g', 15, 'assaisonnement', false, 9,  null),
    ('thiou_rouge', 'laurier',           0.3, 'g',  0, 'assaisonnement', false, 10, null),
    ('thiou_rouge', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 11, null),
    ('thiou_rouge', 'netetou',             1, 'g',  0, 'assaisonnement', false, 12, null),
    ('thiou_rouge', 'sel',                 4, 'g',  0, 'assaisonnement', false, 13, null),
    ('thiou_rouge', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 14, null),
    ('thiou_rouge', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 15, null),
    ('thiou_rouge', 'riz_brise',         150, 'g',  0, 'accompagnement', false, 16, null),

    -- Caldou
    ('caldou', 'poisson_entier', 180, 'g', 20, 'proteine',       false, 1,  null),
    ('caldou', 'citron_vert',     25, 'g',  0, 'base',           false, 2,  'Ajout\xE9 hors du feu'),
    ('caldou', 'oignon',          50, 'g', 10, 'legume',         false, 3,  null),
    ('caldou', 'huile',           15, 'ml', 0, 'matiere_grasse', false, 4,  null),
    ('caldou', 'poivron_vert',    20, 'g',  8, 'legume',         false, 5,  null),
    ('caldou', 'gombo',           20, 'g',  5, 'legume',         true,  6,  null),
    ('caldou', 'ail',              3, 'g', 15, 'assaisonnement', false, 7,  null),
    ('caldou', 'piment_frais',     3, 'g',  0, 'assaisonnement', false, 8,  null),
    ('caldou', 'sel',              3, 'g',  0, 'assaisonnement', false, 9,  null),
    ('caldou', 'bouillon_cube',    2, 'g',  0, 'assaisonnement', false, 10, null),
    ('caldou', 'poivre',         0.3, 'g',  0, 'assaisonnement', false, 11, null),
    ('caldou', 'riz_brise',      150, 'g',  0, 'accompagnement', false, 12, null),

    -- Ndamb\xE9
    ('ndambe', 'niebe',             100, 'g',  0, 'base',           false, 1,  'Tremp\xE9 la veille'),
    ('ndambe', 'huile',              20, 'ml', 0, 'matiere_grasse', false, 2,  null),
    ('ndambe', 'tomate_concentree',  15, 'g',  0, 'assaisonnement', false, 3,  null),
    ('ndambe', 'oignon',             50, 'g', 10, 'legume',         false, 4,  null),
    ('ndambe', 'ail',                 3, 'g', 15, 'assaisonnement', false, 5,  null),
    ('ndambe', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 6,  null),
    ('ndambe', 'sel',                 3, 'g',  0, 'assaisonnement', false, 7,  'Sal\xE9 en fin de cuisson'),
    ('ndambe', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 8,  null),
    ('ndambe', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 9,  null),
    ('ndambe', 'pain_arabe',          1, 'piece', 0, 'accompagnement', true, 10, 'Si servi en sandwich'),

    -- Vermicelle \xE0 la viande
    ('vermicelle_viande', 'vermicelle',        120, 'g',  0, 'base',           false, 1,  null),
    ('vermicelle_viande', 'viande_boeuf_os',   140, 'g',  0, 'proteine',       false, 2,  null),
    ('vermicelle_viande', 'tomate_concentree',  15, 'g',  0, 'assaisonnement', false, 3,  null),
    ('vermicelle_viande', 'oignon',             50, 'g', 10, 'legume',         false, 4,  null),
    ('vermicelle_viande', 'huile',              20, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('vermicelle_viande', 'carotte',            30, 'g', 12, 'legume',         false, 6,  null),
    ('vermicelle_viande', 'petit_pois',         20, 'g',  0, 'legume',         true,  7,  null),
    ('vermicelle_viande', 'ail',                 3, 'g', 15, 'assaisonnement', false, 8,  null),
    ('vermicelle_viande', 'laurier',           0.3, 'g',  0, 'assaisonnement', false, 9,  null),
    ('vermicelle_viande', 'sel',                 3, 'g',  0, 'assaisonnement', false, 10, null),
    ('vermicelle_viande', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 11, null),
    ('vermicelle_viande', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 12, null),

    -- Spaghetti bolognaise
    ('spaghetti_bolognaise', 'spaghetti',         120, 'g',  0, 'base',           false, 1,  null),
    ('spaghetti_bolognaise', 'viande_hachee',     100, 'g',  0, 'proteine',       false, 2,  null),
    ('spaghetti_bolognaise', 'tomate_fraiche',     80, 'g',  5, 'legume',         false, 3,  null),
    ('spaghetti_bolognaise', 'tomate_concentree',  15, 'g',  0, 'assaisonnement', false, 4,  null),
    ('spaghetti_bolognaise', 'oignon',             40, 'g', 10, 'legume',         false, 5,  null),
    ('spaghetti_bolognaise', 'huile',              15, 'ml', 0, 'matiere_grasse', false, 6,  null),
    ('spaghetti_bolognaise', 'carotte',            30, 'g', 12, 'legume',         false, 7,  null),
    ('spaghetti_bolognaise', 'ail',                 3, 'g', 15, 'assaisonnement', false, 8,  null),
    ('spaghetti_bolognaise', 'herbes_provence',     1, 'g',  0, 'assaisonnement', false, 9,  null),
    ('spaghetti_bolognaise', 'paprika',             1, 'g',  0, 'assaisonnement', false, 10, null),
    ('spaghetti_bolognaise', 'sel',                 3, 'g',  0, 'assaisonnement', false, 11, null),
    ('spaghetti_bolognaise', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 12, null),
    ('spaghetti_bolognaise', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 13, null),

    -- Poisson frit et oignons
    ('poisson_firire', 'poisson_frire',     200, 'g', 10, 'proteine',       false, 1,  null),
    ('poisson_firire', 'huile',              40, 'ml', 0, 'matiere_grasse', false, 2,  'Consommation r\xE9elle de friture'),
    ('poisson_firire', 'oignon',            120, 'g', 10, 'legume',         false, 3,  null),
    ('poisson_firire', 'tomate_concentree',  10, 'g',  0, 'assaisonnement', false, 4,  null),
    ('poisson_firire', 'citron_vert',        15, 'g',  0, 'assaisonnement', false, 5,  null),
    ('poisson_firire', 'moutarde',            5, 'g',  0, 'assaisonnement', false, 6,  null),
    ('poisson_firire', 'ail',                 3, 'g', 15, 'assaisonnement', false, 7,  null),
    ('poisson_firire', 'piment_frais',        2, 'g',  0, 'assaisonnement', false, 8,  null),
    ('poisson_firire', 'sel',                 3, 'g',  0, 'assaisonnement', false, 9,  null),
    ('poisson_firire', 'bouillon_cube',       2, 'g',  0, 'assaisonnement', false, 10, null),
    ('poisson_firire', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 11, null),
    ('poisson_firire', 'riz_brise',         150, 'g',  0, 'accompagnement', false, 12, null),

    -- Hamburger b\u0153uf
    ('burger_boeuf', 'pain_burger',     1, 'piece', 0, 'base',           false, 1,  null),
    ('burger_boeuf', 'viande_hachee',  120, 'g',  0, 'proteine',       false, 2,  null),
    ('burger_boeuf', 'salade',          15, 'g', 20, 'legume',         false, 3,  null),
    ('burger_boeuf', 'tomate_fraiche',  30, 'g',  5, 'legume',         false, 4,  null),
    ('burger_boeuf', 'oignon',          25, 'g', 10, 'legume',         false, 5,  null),
    ('burger_boeuf', 'ketchup',         10, 'g',  0, 'assaisonnement', false, 6,  null),
    ('burger_boeuf', 'mayonnaise',      10, 'g',  0, 'assaisonnement', false, 7,  null),
    ('burger_boeuf', 'huile',            5, 'ml', 0, 'matiere_grasse', false, 8,  null),
    ('burger_boeuf', 'sel',            1.5, 'g',  0, 'assaisonnement', false, 9,  null),
    ('burger_boeuf', 'poivre',         0.2, 'g',  0, 'assaisonnement', false, 10, null),
    ('burger_boeuf', 'sachet_emporte',   1, 'piece', 0, 'autre',       true,  11, 'Vente \xE0 emporter'),

    -- Chawarma poulet
    ('chawarma_poulet', 'pain_arabe',        1, 'piece', 0, 'base',           false, 1,  null),
    ('chawarma_poulet', 'poulet',          150, 'g',  0, 'proteine',       false, 2,  '\xC9minc\xE9, marin\xE9 2 h'),
    ('chawarma_poulet', 'oignon',           30, 'g', 10, 'legume',         false, 3,  null),
    ('chawarma_poulet', 'salade',           20, 'g', 20, 'legume',         false, 4,  null),
    ('chawarma_poulet', 'tomate_fraiche',   30, 'g',  5, 'legume',         false, 5,  null),
    ('chawarma_poulet', 'concombre',        15, 'g', 10, 'legume',         false, 6,  null),
    ('chawarma_poulet', 'mayonnaise',       15, 'g',  0, 'assaisonnement', false, 7,  null),
    ('chawarma_poulet', 'sauce_algerienne', 10, 'g',  0, 'assaisonnement', false, 8,  null),
    ('chawarma_poulet', 'huile',             5, 'ml', 0, 'matiere_grasse', false, 9,  null),
    ('chawarma_poulet', 'curry',             1, 'g',  0, 'assaisonnement', false, 10, null),
    ('chawarma_poulet', 'paprika',           1, 'g',  0, 'assaisonnement', false, 11, null),
    ('chawarma_poulet', 'citron_vert',       5, 'g',  0, 'assaisonnement', false, 12, null),
    ('chawarma_poulet', 'sel',             1.5, 'g',  0, 'assaisonnement', false, 13, null),
    ('chawarma_poulet', 'poivre',          0.2, 'g',  0, 'assaisonnement', false, 14, null),
    ('chawarma_poulet', 'sachet_emporte',    1, 'piece', 0, 'autre',       true,  15, null),

    -- Pizza margherita
    ('pizza_margherita', 'farine_patissiere', 200, 'g',  0, 'base',           false, 1,  null),
    ('pizza_margherita', 'levure',              4, 'g',  0, 'base',           false, 2,  null),
    ('pizza_margherita', 'huile',              15, 'ml', 0, 'matiere_grasse', false, 3,  null),
    ('pizza_margherita', 'tomate_concentree',  50, 'g',  0, 'assaisonnement', false, 4,  null),
    ('pizza_margherita', 'fromage_rape',       80, 'g',  0, 'proteine',       false, 5,  null),
    ('pizza_margherita', 'olive_verte',        10, 'g',  0, 'legume',         true,  6,  null),
    ('pizza_margherita', 'herbes_provence',     1, 'g',  0, 'assaisonnement', false, 7,  null),
    ('pizza_margherita', 'sel',                 4, 'g',  0, 'assaisonnement', false, 8,  null),
    ('pizza_margherita', 'carton_pizza',        1, 'piece', 0, 'autre',       false, 9,  null),

    -- Pizza reine
    ('pizza_reine', 'farine_patissiere', 200, 'g',  0, 'base',           false, 1,  null),
    ('pizza_reine', 'levure',              4, 'g',  0, 'base',           false, 2,  null),
    ('pizza_reine', 'huile',              15, 'ml', 0, 'matiere_grasse', false, 3,  null),
    ('pizza_reine', 'tomate_concentree',  50, 'g',  0, 'assaisonnement', false, 4,  null),
    ('pizza_reine', 'fromage_rape',       80, 'g',  0, 'proteine',       false, 5,  null),
    ('pizza_reine', 'jambon',             40, 'g',  0, 'proteine',       false, 6,  null),
    ('pizza_reine', 'champignon',         30, 'g',  0, 'legume',         false, 7,  null),
    ('pizza_reine', 'olive_noire',        10, 'g',  0, 'legume',         false, 8,  null),
    ('pizza_reine', 'herbes_provence',     1, 'g',  0, 'assaisonnement', false, 9,  null),
    ('pizza_reine', 'sel',                 4, 'g',  0, 'assaisonnement', false, 10, null),
    ('pizza_reine', 'carton_pizza',        1, 'piece', 0, 'autre',       false, 11, null),

    -- Tacos poulet
    ('tacos_poulet', 'tacos_galette',      1, 'piece', 0, 'base',           false, 1,  null),
    ('tacos_poulet', 'poulet',           120, 'g',  0, 'proteine',       false, 2,  null),
    ('tacos_poulet', 'pomme_de_terre',   120, 'g', 20, 'legume',         false, 3,  'Frites, dans le tacos'),
    ('tacos_poulet', 'fromage_rape',      30, 'g',  0, 'proteine',       false, 4,  null),
    ('tacos_poulet', 'creme_liquide',     20, 'ml', 0, 'assaisonnement', false, 5,  null),
    ('tacos_poulet', 'sauce_algerienne',  15, 'g',  0, 'assaisonnement', false, 6,  null),
    ('tacos_poulet', 'oignon',            20, 'g', 10, 'legume',         false, 7,  null),
    ('tacos_poulet', 'huile',             25, 'ml', 0, 'matiere_grasse', false, 8,  'Friture des frites'),
    ('tacos_poulet', 'curry',              1, 'g',  0, 'assaisonnement', false, 9,  null),
    ('tacos_poulet', 'sel',              1.5, 'g',  0, 'assaisonnement', false, 10, null),
    ('tacos_poulet', 'poivre',           0.2, 'g',  0, 'assaisonnement', false, 11, null),
    ('tacos_poulet', 'sachet_emporte',     1, 'piece', 0, 'autre',       true,  12, null),

    -- Sandwich thon
    ('sandwich_thon', 'pain_arabe',       1, 'piece', 0, 'base',           false, 1,  null),
    ('sandwich_thon', 'thon',            80, 'g',  0, 'proteine',       false, 2,  'Bien \xE9goutt\xE9'),
    ('sandwich_thon', 'mayonnaise',      15, 'g',  0, 'assaisonnement', false, 3,  null),
    ('sandwich_thon', 'oignon',          20, 'g', 10, 'legume',         false, 4,  null),
    ('sandwich_thon', 'salade',          15, 'g', 20, 'legume',         false, 5,  null),
    ('sandwich_thon', 'tomate_fraiche',  25, 'g',  5, 'legume',         false, 6,  null),
    ('sandwich_thon', 'olive_verte',     10, 'g',  0, 'legume',         false, 7,  null),
    ('sandwich_thon', 'maicedoine',      30, 'g',  0, 'legume',         true,  8,  null),
    ('sandwich_thon', 'citron_vert',      5, 'g',  0, 'assaisonnement', false, 9,  null),
    ('sandwich_thon', 'sel',              1, 'g',  0, 'assaisonnement', false, 10, null),
    ('sandwich_thon', 'poivre',         0.2, 'g',  0, 'assaisonnement', false, 11, null),
    ('sandwich_thon', 'papier_sandwich',  1, 'piece', 0, 'autre',       true,  12, null),

    -- Brochette de b\u0153uf
    ('brochette_boeuf', 'viande_boeuf_os', 120, 'g',  0, 'proteine',       false, 1,  'Morceau sans os'),
    ('brochette_boeuf', 'oignon',           30, 'g', 10, 'legume',         false, 2,  null),
    ('brochette_boeuf', 'poivron_vert',     25, 'g',  8, 'legume',         false, 3,  null),
    ('brochette_boeuf', 'huile',             8, 'ml', 0, 'matiere_grasse', false, 4,  null),
    ('brochette_boeuf', 'moutarde',          5, 'g',  0, 'assaisonnement', false, 5,  null),
    ('brochette_boeuf', 'ail',               2, 'g', 15, 'assaisonnement', false, 6,  null),
    ('brochette_boeuf', 'paprika',         0.5, 'g',  0, 'assaisonnement', false, 7,  null),
    ('brochette_boeuf', 'sel',             1.5, 'g',  0, 'assaisonnement', false, 8,  null),
    ('brochette_boeuf', 'poivre',          0.2, 'g',  0, 'assaisonnement', false, 9,  null),
    ('brochette_boeuf', 'pick_brochette',    1, 'piece', 0, 'autre',       false, 10, null),
    ('brochette_boeuf', 'charbon',          25, 'g',  0, 'autre',         true,  11, 'Cuisson sur braise'),

    -- Poulet frit et frites
    ('poulet_frit_frites', 'poulet',            250, 'g',  0, 'proteine',       false, 1,  'Un quart de poulet'),
    ('poulet_frit_frites', 'farine_patissiere',  30, 'g',  0, 'base',           false, 2,  'Panure'),
    ('poulet_frit_frites', 'pomme_de_terre',    200, 'g', 20, 'legume',         false, 3,  null),
    ('poulet_frit_frites', 'huile',              60, 'ml', 0, 'matiere_grasse', false, 4,  'Consommation r\xE9elle de friture'),
    ('poulet_frit_frites', 'paprika',             1, 'g',  0, 'assaisonnement', false, 5,  null),
    ('poulet_frit_frites', 'curry',               1, 'g',  0, 'assaisonnement', false, 6,  null),
    ('poulet_frit_frites', 'ail',                 2, 'g', 15, 'assaisonnement', false, 7,  null),
    ('poulet_frit_frites', 'sel',                 3, 'g',  0, 'assaisonnement', false, 8,  null),
    ('poulet_frit_frites', 'poivre',            0.3, 'g',  0, 'assaisonnement', false, 9,  null),
    ('poulet_frit_frites', 'ketchup',            15, 'g',  0, 'assaisonnement', true,  10, null),
    ('poulet_frit_frites', 'sachet_emporte',      1, 'piece', 0, 'autre',       true,  11, null),

    -- Croissant
    ('croissant', 'farine_patissiere',  45, 'g',  0, 'base',           false, 1,  null),
    ('croissant', 'beurre',             25, 'g',  0, 'matiere_grasse', false, 2,  'Beurre de tourage'),
    ('croissant', 'sucre',               4, 'g',  0, 'assaisonnement', false, 3,  null),
    ('croissant', 'lait_poudre',         2, 'g',  0, 'base',           false, 4,  null),
    ('croissant', 'levure',              1, 'g',  0, 'base',           false, 5,  null),
    ('croissant', 'sel',               0.8, 'g',  0, 'assaisonnement', false, 6,  null),
    ('croissant', 'oeuf',              0.1, 'piece', 0, 'base',        false, 7,  'Dorure'),
    ('croissant', 'sachet_croissant',    1, 'piece', 0, 'autre',       true,  8,  null),

    -- Pain au chocolat
    ('pain_chocolat', 'farine_patissiere', 45, 'g',  0, 'base',           false, 1,  null),
    ('pain_chocolat', 'beurre',            25, 'g',  0, 'matiere_grasse', false, 2,  null),
    ('pain_chocolat', 'chocolat',          12, 'g',  0, 'base',           false, 3,  'Deux barres'),
    ('pain_chocolat', 'sucre',              4, 'g',  0, 'assaisonnement', false, 4,  null),
    ('pain_chocolat', 'lait_poudre',        2, 'g',  0, 'base',           false, 5,  null),
    ('pain_chocolat', 'levure',             1, 'g',  0, 'base',           false, 6,  null),
    ('pain_chocolat', 'sel',              0.8, 'g',  0, 'assaisonnement', false, 7,  null),
    ('pain_chocolat', 'oeuf',             0.1, 'piece', 0, 'base',        false, 8,  'Dorure'),

    -- Cake nature
    ('cake_nature', 'farine_patissiere', 40, 'g',  0, 'base',           false, 1,  null),
    ('cake_nature', 'sucre',             30, 'g',  0, 'base',           false, 2,  null),
    ('cake_nature', 'beurre',            25, 'g',  0, 'matiere_grasse', false, 3,  null),
    ('cake_nature', 'oeuf',             0.6, 'piece', 0, 'proteine',    false, 4,  null),
    ('cake_nature', 'levure',             1, 'g',  0, 'base',           false, 5,  null),
    ('cake_nature', 'vanille',          0.5, 'ml', 0, 'assaisonnement', false, 6,  null),
    ('cake_nature', 'lait_poudre',        3, 'g',  0, 'base',           false, 7,  null),
    ('cake_nature', 'sel',              0.3, 'g',  0, 'assaisonnement', false, 8,  null),

    -- Beignet sucr\xE9
    ('beignet_sucre', 'farine_patissiere', 35, 'g',  0, 'base',           false, 1,  null),
    ('beignet_sucre', 'sucre',             16, 'g',  0, 'base',           false, 2,  'P\xE2te et enrobage'),
    ('beignet_sucre', 'levure',             1, 'g',  0, 'base',           false, 3,  null),
    ('beignet_sucre', 'oeuf',            0.15, 'piece', 0, 'proteine',    false, 4,  null),
    ('beignet_sucre', 'lait_poudre',        3, 'g',  0, 'base',           false, 5,  null),
    ('beignet_sucre', 'huile',             15, 'ml', 0, 'matiere_grasse', false, 6,  'Consommation r\xE9elle de friture'),
    ('beignet_sucre', 'fleur_oranger',    0.5, 'ml', 0, 'assaisonnement', true,  7,  null),
    ('beignet_sucre', 'sel',              0.3, 'g',  0, 'assaisonnement', false, 8,  null),

    -- G\xE2teau au chocolat
    ('gateau_chocolat', 'chocolat',          35, 'g',  0, 'base',           false, 1,  null),
    ('gateau_chocolat', 'farine_patissiere', 30, 'g',  0, 'base',           false, 2,  null),
    ('gateau_chocolat', 'sucre',             28, 'g',  0, 'base',           false, 3,  null),
    ('gateau_chocolat', 'beurre',            25, 'g',  0, 'matiere_grasse', false, 4,  null),
    ('gateau_chocolat', 'oeuf',             0.8, 'piece', 0, 'proteine',    false, 5,  null),
    ('gateau_chocolat', 'cacao',              5, 'g',  0, 'assaisonnement', false, 6,  null),
    ('gateau_chocolat', 'creme_liquide',     10, 'ml', 0, 'base',           true,  7,  'Ganache'),
    ('gateau_chocolat', 'levure',             1, 'g',  0, 'base',           false, 8,  null),
    ('gateau_chocolat', 'sel',              0.3, 'g',  0, 'assaisonnement', false, 9,  null),

    -- Omelette aux l\xE9gumes
    ('omelette_legumes', 'oeuf',             2, 'piece', 0, 'proteine',    false, 1,  null),
    ('omelette_legumes', 'oignon',          20, 'g', 10, 'legume',         false, 2,  null),
    ('omelette_legumes', 'tomate_fraiche',  25, 'g',  5, 'legume',         false, 3,  null),
    ('omelette_legumes', 'poivron_vert',    15, 'g',  8, 'legume',         false, 4,  null),
    ('omelette_legumes', 'huile',           10, 'ml', 0, 'matiere_grasse', false, 5,  null),
    ('omelette_legumes', 'persil',           2, 'g',  0, 'assaisonnement', true,  6,  null),
    ('omelette_legumes', 'sel',            1.5, 'g',  0, 'assaisonnement', false, 7,  null),
    ('omelette_legumes', 'poivre',         0.2, 'g',  0, 'assaisonnement', false, 8,  null),

    -- Caf\xE9 au lait
    ('cafe_au_lait', 'cafe',         8, 'g',  0, 'base',           false, 1,  null),
    ('cafe_au_lait', 'lait_poudre', 15, 'g',  0, 'base',           false, 2,  null),
    ('cafe_au_lait', 'sucre',       12, 'g',  0, 'assaisonnement', false, 3,  null),
    ('cafe_au_lait', 'gobelet',      1, 'piece', 0, 'autre',       true,  4,  'Vente \xE0 emporter'),

    -- Bouillie au bouye
    ('bouillie_bouye', 'couscous_thiere', 60, 'g',  0, 'base',           false, 1,  'Couscous de mil'),
    ('bouillie_bouye', 'bouye',           25, 'g',  0, 'base',           false, 2,  'Tamis\xE9'),
    ('bouillie_bouye', 'lait_poudre',     20, 'g',  0, 'base',           false, 3,  null),
    ('bouillie_bouye', 'sucre',           20, 'g',  0, 'assaisonnement', false, 4,  null),
    ('bouillie_bouye', 'vanille',        0.2, 'ml', 0, 'assaisonnement', true,  5,  null),
    ('bouillie_bouye', 'sel',            0.2, 'g',  0, 'assaisonnement', false, 6,  null)
  ) as d(tkey, ikey, qty, unit, loss, irole, opt, pos, note)
  join public.recipe_templates t on t.organization_id is null and t.key = d.tkey
on conflict (template_id, ingredient_key) do update
  set quantity_per_portion = excluded.quantity_per_portion,
      unit_code            = excluded.unit_code,
      loss_pct             = excluded.loss_pct,
      role                 = excluded.role,
      is_optional          = excluded.is_optional,
      position             = excluded.position,
      note                 = excluded.note;
`}],ge=[{reference:"CDT-001",name:"Crevette sechee",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 2"},{reference:"CDT-002",name:"Guedj beurre",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 3"},{reference:"CDT-003",name:"Guedj kong",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 4"},{reference:"CDT-004",name:"Keithia",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 5"},{reference:"CDT-005",name:"Kong fume",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 6"},{reference:"CDT-006",name:"Pagne",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 7"},{reference:"CDT-007",name:"Yet",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 8"},{reference:"CDT-008",name:"Yet bou sew",category:"Condiments",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 9"},{reference:"CSM-003",name:"Carton pizza",category:"Consommables",category_kind:"consumable",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 12"},{reference:"CSM-004",name:"Charbon",category:"Consommables",category_kind:"consumable",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 13"},{reference:"CSM-005",name:"Gant",category:"Consommables",category_kind:"consumable",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 14"},{reference:"CSM-006",name:"Gobelet cafe",category:"Consommables",category_kind:"consumable",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 15"},{reference:"CSM-008",name:"Moule gratin",category:"Consommables",category_kind:"consumable",stock_unit:"piece",purchase_unit:"",package_factor:"",source:"Revue ligne 17"},{reference:"CSM-009",name:"Papier alu gm",category:"Consommables",category_kind:"consumable",stock_unit:"piece",purchase_unit:"",package_factor:"",source:"Revue ligne 18"},{reference:"CSM-010",name:"Papier film",category:"Consommables",category_kind:"consumable",stock_unit:"piece",purchase_unit:"paquet",package_factor:"",source:"Revue ligne 19"},{reference:"CSM-011",name:"Papier sandwich",category:"Consommables",category_kind:"consumable",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 20"},{reference:"CSM-012",name:"Pick brochette deco",category:"Consommables",category_kind:"consumable",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 21"},{reference:"CSM-013",name:"Pick brochette gm",category:"Consommables",category_kind:"consumable",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 22"},{reference:"CSM-014",name:"Pot pizza gobelets",category:"Consommables",category_kind:"consumable",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 23"},{reference:"CSM-015",name:"Sachet croissant",category:"Consommables",category_kind:"consumable",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 24"},{reference:"CSM-016",name:"Sachet emporte",category:"Consommables",category_kind:"consumable",stock_unit:"piece",purchase_unit:"",package_factor:"",source:"Revue ligne 25"},{reference:"CSM-017",name:"Sachet jaune de 100f",category:"Consommables",category_kind:"consumable",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 26"},{reference:"CSM-018",name:"Serviette de table",category:"Consommables",category_kind:"consumable",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 27"},{reference:"ENT-001",name:"Ballaie",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 51"},{reference:"ENT-002",name:"Creme a recurer",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 52"},{reference:"ENT-003",name:"Eau de javel",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"tas",purchase_unit:"",package_factor:"",source:"Revue ligne 53"},{reference:"ENT-004",name:"Eponge en fer",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 54"},{reference:"ENT-005",name:"Lave vitre",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 55"},{reference:"ENT-006",name:"Madar gm",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 56"},{reference:"ENT-007",name:"Raclette",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 57"},{reference:"ENT-008",name:"Serpillere",category:"Produits d'entretien",category_kind:"maintenance",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 58"},{reference:"FRO-001",name:"Capitaine",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 59"},{reference:"FRO-002",name:"Poisson dorade",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 60"},{reference:"FRO-003",name:"Poisson gm",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 61"},{reference:"FRO-004",name:"Poisson lotte",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 62"},{reference:"FRO-005",name:"Poulet blanc",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 63"},{reference:"FRO-006",name:"Poulets",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"piece",purchase_unit:"",package_factor:"",source:"Revue ligne 64"},{reference:"FRO-007",name:"Viande hachee",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 65"},{reference:"FRO-009",name:"Viande locale",category:"Froid - viandes et poissons",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 67"},{reference:"LEG-001",name:"Bissap kouthia",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"seau",purchase_unit:"",package_factor:"",source:"Revue ligne 68"},{reference:"LEG-002",name:"Brocolis",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 69"},{reference:"LEG-003",name:"Carotte",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 70"},{reference:"LEG-004",name:"Chou",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 71"},{reference:"LEG-005",name:"Citron vert",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 72"},{reference:"LEG-006",name:"Concombre",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 73"},{reference:"LEG-007",name:"Courgette",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 74"},{reference:"LEG-008",name:"Gombon",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 75"},{reference:"LEG-009",name:"Haricot vert",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 76"},{reference:"LEG-010",name:"Manioc",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 77"},{reference:"LEG-011",name:"Oignon vert",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"tas",purchase_unit:"",package_factor:"",source:"Revue ligne 78"},{reference:"LEG-012",name:"Patate",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 79"},{reference:"LEG-013",name:"Peril ordinnaire",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"tas",purchase_unit:"",package_factor:"",source:"Revue ligne 80"},{reference:"LEG-014",name:"Persil chinois",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"tas",purchase_unit:"",package_factor:"",source:"Revue ligne 81"},{reference:"LEG-015",name:"Petit bpois surgele",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 82"},{reference:"LEG-016",name:"Piment gouana sofia",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 83"},{reference:"LEG-018",name:"Poivron vert",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 85"},{reference:"LEG-019",name:"Salade",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"bassine",purchase_unit:"",package_factor:"",source:"Revue ligne 86"},{reference:"LEG-020",name:"Tomate fraiche",category:"Fruits et l\xE9gumes",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 87"},{reference:"SEC-003",name:"Ail",category:"Produits secs",category_kind:"food",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 90"},{reference:"SEC-004",name:"Amora",category:"Produits secs",category_kind:"food",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 91"},{reference:"SEC-005",name:"Ataya",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 92"},{reference:"SEC-006",name:"Athieke",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 93"},{reference:"SEC-009",name:"Bouye",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 96"},{reference:"SEC-011",name:"Calamar",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 98"},{reference:"SEC-012",name:"Canette pressesa",category:"Produits secs",category_kind:"food",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 99"},{reference:"SEC-013",name:"Carry",category:"Produits secs",category_kind:"food",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 100"},{reference:"SEC-014",name:"Champignon",category:"Produits secs",category_kind:"food",stock_unit:"pot",purchase_unit:"",package_factor:"",source:"Revue ligne 101"},{reference:"SEC-015",name:"Citron liquide",category:"Produits secs",category_kind:"food",stock_unit:"l",purchase_unit:"",package_factor:"",source:"Revue ligne 102"},{reference:"SEC-017",name:"Creme liquide",category:"Produits secs",category_kind:"food",stock_unit:"l",purchase_unit:"",package_factor:"",source:"Revue ligne 104"},{reference:"SEC-018",name:"Crevette n\xB01",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 105"},{reference:"SEC-019",name:"Crevette n\xB02",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 106"},{reference:"SEC-021",name:"Curcuman",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 108"},{reference:"SEC-023",name:"Epice curry",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 110"},{reference:"SEC-024",name:"Epice paprika",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 111"},{reference:"SEC-025",name:"Epice thyn",category:"Produits secs",category_kind:"food",stock_unit:"piece",purchase_unit:"",package_factor:"",source:"Revue ligne 112"},{reference:"SEC-026",name:"Essence menthe",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 113"},{reference:"SEC-027",name:"Essence vanille",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 114"},{reference:"SEC-028",name:"Farine patissier",category:"Produits secs",category_kind:"food",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 115"},{reference:"SEC-029",name:"Fleur d'orange",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 116"},{reference:"SEC-030",name:"Foster mangue",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 117"},{reference:"SEC-031",name:"Foster vimto",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 118"},{reference:"SEC-035",name:"Herbe de province",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 122"},{reference:"SEC-039",name:"Jambon",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 126"},{reference:"SEC-040",name:"Ketchup",category:"Produits secs",category_kind:"food",stock_unit:"bouteille",purchase_unit:"",package_factor:"",source:"Revue ligne 127"},{reference:"SEC-041",name:"Lait en poudre",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"sac",package_factor:"",source:"Revue ligne 128"},{reference:"SEC-042",name:"Laurier",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 129"},{reference:"SEC-043",name:"Lentille",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 130"},{reference:"SEC-045",name:"Maicedoine",category:"Produits secs",category_kind:"food",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 132"},{reference:"SEC-046",name:"Mayonnaise",category:"Produits secs",category_kind:"food",stock_unit:"seau",purchase_unit:"",package_factor:"",source:"Revue ligne 133"},{reference:"SEC-047",name:"Moutarde",category:"Produits secs",category_kind:"food",stock_unit:"seau",purchase_unit:"",package_factor:"",source:"Revue ligne 134"},{reference:"SEC-048",name:"Netetou en poudre",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 135"},{reference:"SEC-049",name:"Niebe",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 136"},{reference:"SEC-050",name:"Noflaye",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 137"},{reference:"SEC-051",name:"\u0152uf",category:"Produits secs",category_kind:"food",stock_unit:"tablette",purchase_unit:"",package_factor:"",source:"Revue ligne 138"},{reference:"SEC-052",name:"Oignon blanc",category:"Produits secs",category_kind:"food",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 139"},{reference:"SEC-053",name:"Oignon locale",category:"Produits secs",category_kind:"food",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 140"},{reference:"SEC-054",name:"Olive",category:"Produits secs",category_kind:"food",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 141"},{reference:"SEC-055",name:"Olive noire gm",category:"Produits secs",category_kind:"food",stock_unit:"pot",purchase_unit:"",package_factor:"",source:"Revue ligne 142"},{reference:"SEC-056",name:"Oro",category:"Produits secs",category_kind:"food",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 143"},{reference:"SEC-057",name:"Pain arabe",category:"Produits secs",category_kind:"food",stock_unit:"paquet",purchase_unit:"",package_factor:"",source:"Revue ligne 144"},{reference:"SEC-058",name:"Pate d'arachide",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 145"},{reference:"SEC-059",name:"Petit pois",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 146"},{reference:"SEC-060",name:"Piment en poudre",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 147"},{reference:"SEC-061",name:"Poisson frire",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 148"},{reference:"SEC-063",name:"Pomme de terre",category:"Produits secs",category_kind:"food",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 150"},{reference:"SEC-065",name:"Riz parfume pithibi",category:"Produits secs",category_kind:"food",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 152"},{reference:"SEC-066",name:"Sauce algerienne",category:"Produits secs",category_kind:"food",stock_unit:"seau",purchase_unit:"",package_factor:"",source:"Revue ligne 153"},{reference:"SEC-067",name:"Sauce chili",category:"Produits secs",category_kind:"food",stock_unit:"bouteille",purchase_unit:"",package_factor:"",source:"Revue ligne 154"},{reference:"SEC-068",name:"Saucisson",category:"Produits secs",category_kind:"food",stock_unit:"barre",purchase_unit:"",package_factor:"",source:"Revue ligne 155"},{reference:"SEC-069",name:"Sel grain",category:"Produits secs",category_kind:"food",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 156"},{reference:"SEC-070",name:"Soja",category:"Produits secs",category_kind:"food",stock_unit:"bouteille",purchase_unit:"",package_factor:"",source:"Revue ligne 157"},{reference:"SEC-071",name:"Spaguetty",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 158"},{reference:"SEC-072",name:"Sucre en morceaux",category:"Produits secs",category_kind:"food",stock_unit:"piece",purchase_unit:"",package_factor:"",source:"Revue ligne 159"},{reference:"SEC-073",name:"Sucre en poudre",category:"Produits secs",category_kind:"food",stock_unit:"sac",purchase_unit:"",package_factor:"",source:"Revue ligne 160"},{reference:"SEC-074",name:"Sunquick",category:"Produits secs",category_kind:"food",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 161"},{reference:"SEC-075",name:"Tacos",category:"Produits secs",category_kind:"food",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 162"},{reference:"SEC-076",name:"Tamarin",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 163"},{reference:"SEC-077",name:"Tandori",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 164"},{reference:"SEC-078",name:"Thon",category:"Produits secs",category_kind:"food",stock_unit:"pot",purchase_unit:"",package_factor:"",source:"Revue ligne 165"},{reference:"SEC-079",name:"Tomate concentree",category:"Produits secs",category_kind:"food",stock_unit:"pack",purchase_unit:"",package_factor:"",source:"Revue ligne 166"},{reference:"SEC-080",name:"Vermicelle",category:"Produits secs",category_kind:"food",stock_unit:"kg",purchase_unit:"",package_factor:"",source:"Revue ligne 167"},{reference:"SEC-081",name:"Vinaigre",category:"Produits secs",category_kind:"food",stock_unit:"carton",purchase_unit:"",package_factor:"",source:"Revue ligne 168"}];var fe,X=(async()=>{let r=performance.now(),c=new Re({extensions:{pgcrypto:Le}});await re(c,me),ie(c);let l=await ce(c,{rows:ge});fe=_e(c),console.info(`[GesCatering] d\xE9monstration pr\xEAte en ${Math.round(performance.now()-r)} ms`,`\u2014 ${l.products} produits, ${l.stocked} en stock`)})();X.catch(r=>console.error("[GesCatering] la d\xE9monstration n'a pas pu d\xE9marrer",r));window.gcDemo={ready:X,async call(r,c,l,h){await X;let C=await fe({method:r,path:c,body:l?JSON.parse(l):{},user:h||void 0});return JSON.stringify(C)}};
