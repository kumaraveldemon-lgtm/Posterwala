"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { Order, OrderStatus } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search,
  Package,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Mail,
  X,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Fulfillment form states for selected order
  const [statusVal, setStatusVal] = useState<OrderStatus>("Printing");
  const [carrierVal, setCarrierVal] = useState("Delhivery Express");
  const [trackingVal, setTrackingVal] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatusVal(order.status);
    setCarrierVal(order.tracking_carrier || "Delhivery Express");
    setTrackingVal(order.tracking_number || "");
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          orderNumber: selectedOrder.order_number,
          customerName: selectedOrder.shipping_name,
          customerEmail: selectedOrder.customer_email,
          totalAmount: selectedOrder.total_amount,
          status: statusVal,
          trackingCarrier: carrierVal,
          trackingNumber: trackingVal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: statusVal,
                tracking_carrier: carrierVal,
                tracking_number: trackingVal,
                updated_at: new Date().toISOString(),
              }
            : o
        )
      );

      toast.success(
        `Order #${selectedOrder.order_number} updated to "${statusVal}"! Email notification sent.`
      );
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Orders</p>
          <p className="text-2xl font-black font-display text-foreground mt-1">{orders.length}</p>
        </Card>
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-700 uppercase">On Print Queue</p>
          <p className="text-2xl font-black font-display text-amber-800 mt-1">
            {orders.filter((o) => o.status === "Printing" || o.status === "Received").length}
          </p>
        </Card>
        <Card className="p-4 border-blue-500/30 bg-blue-500/5">
          <p className="text-xs font-semibold text-blue-700 uppercase">Shipped in Transit</p>
          <p className="text-2xl font-black font-display text-blue-800 mt-1">
            {orders.filter((o) => o.status === "Shipped").length}
          </p>
        </Card>
        <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Delivered</p>
          <p className="text-2xl font-black font-display text-emerald-800 mt-1">
            {orders.filter((o) => o.status === "Delivered").length}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by number, email, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["all", "Received", "Printing", "Shipped", "Delivered"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? "bg-slate-900 text-white"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "all" ? "All Orders" : st}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Orders Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-y border-border">
                <tr>
                  <th className="py-3 px-6">Order Reference</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Items</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-foreground font-mono">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-foreground">{order.shipping_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_city}, {order.shipping_pincode}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-md">
                        {order.items?.length || 1} prints
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-foreground">
                      {formatINR(order.total_amount)}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : order.status === "Shipped"
                            ? "bg-blue-500/10 text-blue-600"
                            : order.status === "Printing"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-purple-500/10 text-purple-600"
                        }`}
                      >
                        {order.status === "Delivered" && <CheckCircle2 className="h-3 w-3" />}
                        {order.status === "Shipped" && <Truck className="h-3 w-3" />}
                        {order.status === "Printing" && <Printer className="h-3 w-3" />}
                        {order.status === "Received" && <Clock className="h-3 w-3" />}
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                        className="rounded-xl text-xs bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 ml-auto"
                      >
                        Fulfill & Print
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Order Full Fulfillment Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-brand-600">
                  Prepress & Fulfillment Panel
                </span>
                <h3 className="text-2xl font-black font-display text-foreground mt-0.5">
                  Order #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-muted/40 p-4 text-xs">
              <div>
                <p className="font-bold text-foreground mb-1">Customer & Delivery Address</p>
                <p>{selectedOrder.shipping_name}</p>
                <p className="text-muted-foreground">{selectedOrder.shipping_phone}</p>
                <p className="text-muted-foreground mt-1">{selectedOrder.shipping_address}</p>
                <p className="text-muted-foreground">
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}
                </p>
              </div>

              <div>
                <p className="font-bold text-foreground mb-1">Payment & Receipt</p>
                <p className="text-muted-foreground">Status: <strong className="text-emerald-600">Paid via Razorpay</strong></p>
                <p className="text-muted-foreground">Total: <strong>{formatINR(selectedOrder.total_amount)}</strong></p>
                <p className="text-muted-foreground">Email: {selectedOrder.customer_email}</p>
              </div>
            </div>

            {/* Ordered Prints with 300 DPI Prepress Download */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Prints to Produce (300 DPI Master Files)
              </h4>

              {selectedOrder.items?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-background p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                      <Image
                        src={item.design?.watermark_storage_path || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80"}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-sm text-foreground">{item.product_name}</p>
                      <p className="text-muted-foreground">{item.size_name} • {item.finish} finish</p>
                      {item.custom_config?.text && (
                        <p className="text-brand-600 font-semibold mt-0.5">
                          Custom Text: &quot;{item.custom_config.text.content}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 300 DPI Export Action */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`/api/admin/orders/export-print?orderNumber=${selectedOrder.order_number}&width=2480&height=3508&bleed=3`}
                      download
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download 300 DPI (3mm Bleed)
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Update & Tracking Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-600" />
                Update Order Status & Send Email Notification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Order Status
                  </label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as OrderStatus)}
                    className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs font-medium"
                  >
                    <option value="Received">Received</option>
                    <option value="Printing">Printing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Courier Carrier
                  </label>
                  <select
                    value={carrierVal}
                    onChange={(e) => setCarrierVal(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs font-medium"
                  >
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC Express">DTDC Express</option>
                    <option value="India Post SpeedPost">India Post SpeedPost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Tracking Number (AWB)
                  </label>
                  <Input
                    placeholder="e.g. DEL998273615IN"
                    value={trackingVal}
                    onChange={(e) => setTrackingVal(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold h-12 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isUpdating ? "Updating & Dispatching Email..." : "Update Status & Email Customer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
