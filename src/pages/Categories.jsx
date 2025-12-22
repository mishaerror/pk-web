import React from 'react';

const sampleCategories = ['Clothes','Accessories','Home','Outdoors','Electronics'];

export default function Categories(){
  return (
    <main className="page-root">
      <div className="container">
        <h2>Categories</h2>
        <div className="grid-list categories">
          {sampleCategories.map((c,idx)=> (
            <div className="card category-item" key={idx}>
              <div className="category-title">{c}</div>
              <div className="category-actions"><button className="btn">Edit</button></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
