import React from 'react';

const sampleOrders = new Array(8).fill(0).map((_,i)=>({id:1000+i, customer:`Customer ${i+1}`, total:`$${(10+i)*3}`, status: i%3===0? 'Open' : 'Shipped'}));

export default function Orders(){
  return (
    <main className="page-root">
      <div className="container">
        <h2>Orders</h2>
        <div className="table-wrap">
          <table className="responsive-table">
            <thead>
              <tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {sampleOrders.map(o=> (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.total}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
