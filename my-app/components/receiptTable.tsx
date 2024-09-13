import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { FaTimes, FaPlus } from "react-icons/fa"; // Import the new plus icon
import React from "react";

// Define the structure of a receipt item
interface ReceiptItem {
  id: number;
  item: string;
  price: number;
}

interface ReceiptTableProps {
  receiptItems: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  onEditItem: (
    id: number,
    updatedItem: Partial<{
      item: string;
      price: number;
      subtotal?: number;
      tax?: number;
      total?: number;
    }>
  ) => void;
  onRemoveItem: (id: number) => void;
  onReorderItems: (items: ReceiptItem[]) => void;
  onAddNewItem: (newItem: ReceiptItem) => void; // Handler for adding new items
}

export default function ReceiptTable({
  receiptItems,
  subtotal,
  tax,
  total,
  onEditItem,
  onRemoveItem,
  onReorderItems,
  onAddNewItem,
}: ReceiptTableProps) {
  // Local state for new item inputs
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemPrice, setNewItemPrice] = React.useState("");

  // Handle the drag-and-drop reorder event
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(receiptItems);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    onReorderItems(reorderedItems); // Trigger the handler to update the state and Firebase
  };

  const handleItemEdit = (id: number, field: string, value: string) => {
    const updatedValue =
      field === "price" ? parseFloat(value.replace(/[^\d.]/g, "")) || 0 : value;
    onEditItem(id, { [field]: updatedValue });
  };

  // Handle adding a new item
  const handleAddNewItem = () => {
    if (newItemName.trim() && newItemPrice) {
      const newItem: ReceiptItem = {
        id: Date.now(), // Use a timestamp for unique id
        item: newItemName,
        price: parseFloat(newItemPrice),
      };

      onAddNewItem(newItem);
      setNewItemName(""); // Reset the input fields
      setNewItemPrice("");
    }
  };

  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-[#353B47]">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="receiptItems">
          {(provided) => (
            <table
              className="min-w-full text-white"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr className="bg-[#1A2535]">
                  <th className="py-3 px-4 text-left font-medium text-white"></th>
                  <th className="py-3 px-4 text-left font-medium text-white">
                    Item
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-white">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {receiptItems.map((item, index) => (
                  <Draggable
                    key={item.id.toString()}
                    draggableId={item.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-600 hover:bg-[#4A4F5C]"
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                      >
                        <td className="py-3 px-4">
                          <button onClick={() => onRemoveItem(item.id)}>
                            <FaTimes className="text-red-500" />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) =>
                              handleItemEdit(item.id, "item", e.target.value)
                            }
                            className="bg-transparent text-white border-gray-400 focus:outline-none w-full"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={'$' + item.price.toFixed(2)}
                            onChange={(e) =>
                              handleItemEdit(item.id, "price", e.target.value)
                            }
                            className="bg-transparent text-white w-full text-right focus:outline-none"
                          />
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      {/* Section to add new items */}
      <div className="px-4 py-4 flex justify-between items-center">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="New item name"
          className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
        />
        <input
          type="text"
          value={newItemPrice}
          onChange={(e) =>
            setNewItemPrice(e.target.value.replace(/[^\d.]/g, ""))
          }
          placeholder="Price"
          className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
        />
        <button onClick={handleAddNewItem}>
          <FaPlus className="text-[#35B2EB]" />
        </button>
      </div>

      {/* Line separator */}
      <hr className="my-4 border-t border-gray-500" />

      {/* Display Subtotal, Tax, and Total */}
      <div className="px-4 py-2 text-white text-lg">
        <p className="mb-2">
          Subtotal: $
          <input
            type="text"
            value={subtotal.toFixed(2)}
            onChange={(e) =>
              onEditItem(0, {
                subtotal:
                  parseFloat(e.target.value.replace(/[^\d.]/g, "")) || 0,
              })
            }
            className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
          />
        </p>
        <p className="mb-2">
          Tax: $
          <input
            type="text"
            value={tax.toFixed(2)}
            onChange={(e) =>
              onEditItem(0, {
                tax: parseFloat(e.target.value.replace(/[^\d.]/g, "")) || 0,
              })
            }
            className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
          />
        </p>
        <p className="font-bold">
          Total: $
          <input
            type="text"
            value={total.toFixed(2)}
            onChange={(e) =>
              onEditItem(0, {
                total: parseFloat(e.target.value.replace(/[^\d.]/g, "")) || 0,
              })
            }
            className="bg-transparent text-white border-b border-gray-400 focus:outline-none"
          />
        </p>
      </div>
    </div>
  );
}
