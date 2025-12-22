import React from 'react';

const sampleItems = new Array(10).fill(0).map((_,i)=>({id:200+i, name:`Item ${i+1}`, category: i%2===0? 'Clothes' : 'Accessories', price:`$${(5+i)*2}`}));

export default function Items(){
  return (
    <main className="page-root">
      <div className="container">
        <h2>Items</h2>
        <div className="grid-list">
          {sampleItems.map(it=> (
            <div className="card list-item" key={it.id}>
              <div className="item-left">
                <div className="thumb" />
              </div>
              <div className="item-body">
                <div className="item-title">{it.name}</div>
                <div className="item-meta">{it.category} · {it.price}</div>
              </div>
              <div className="item-actions">
                <button className="btn">Edit</button>
                <button className="btn danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
