import React, { useState, useEffect, useMemo } from "react";

export default function App() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Rahul",
            email: "rahul@gmail.com",
            role: "Admin",
            status: "Active",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Aman",
            email: "aman@gmail.com",
            role: "Developer",
            status: "Active",
            createdAt: new Date().toISOString(),
          },
          {
            id: 3,
            name: "Manan",
            email: "manan@gmail.com",
            role: "Designer",
            status: "Inactive",
            createdAt: new Date().toISOString(),
          },
        ];
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [editingId, setEditingId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 5;

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const logActivity = (action, user) => {
    setActivityLog((prev) => [
      {
        id: Date.now(),
        action,
        user,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      alert("All fields are required");
      return;
    }

    if (editingId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingId ? { ...user, ...formData } : user,
        ),
      );

      logActivity("UPDATED", formData.name);
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        status: "Active",
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      logActivity("CREATED", formData.name);
    }

    resetForm();
  };

  const handleDelete = (id) => {
    const user = users.find((u) => u.id === id);

    if (window.confirm("Delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      logActivity("DELETED", user.name);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user,
      ),
    );
  };

  const handleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  const deleteSelected = () => {
    if (!selectedUsers.length) return;

    if (window.confirm("Delete selected users?")) {
      setUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user.id)),
      );

      setSelectedUsers([]);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) =>
      a[sortBy].toString().localeCompare(b[sortBy].toString()),
    );
  }, [filteredUsers, sortBy]);

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    admins: users.filter((u) => u.role === "Admin").length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: darkMode ? "#111" : "#f4f4f4",
        color: darkMode ? "#fff" : "#000",
        fontFamily: "Arial",
      }}
    >
      <h1>🚀 Advanced User Management Dashboard</h1>

      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>

      <hr />

      {/* Dashboard Stats */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>👥 Total: {stats.total}</div>
        <div>✅ Active: {stats.active}</div>
        <div>❌ Inactive: {stats.inactive}</div>
        <div>👑 Admins: {stats.admins}</div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
        />

        <button type="submit">{editingId ? "Update User" : "Add User"}</button>
      </form>

      <hr />

      {/* Search & Sort */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>
        <option value="email">Email</option>
        <option value="role">Role</option>
        <option value="status">Status</option>
      </select>

      <button onClick={deleteSelected}>
        Delete Selected ({selectedUsers.length})
      </button>

      <hr />

      {/* Users */}
      {paginatedUsers.map((user) => (
        <div
          key={user.id}
          style={{
            padding: "15px",
            border: "1px solid gray",
            borderRadius: "10px",
            marginBottom: "10px",
            background: darkMode ? "#222" : "#fff",
          }}
        >
          <input
            type="checkbox"
            checked={selectedUsers.includes(user.id)}
            onChange={() => handleSelect(user.id)}
          />

          <img
            src={`https://ui-avatars.com/api/?name=${user.name}`}
            alt={user.name}
            style={{
              width: "50px",
              borderRadius: "50%",
              marginLeft: "10px",
            }}
          />

          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
          <p>Status: {user.status}</p>

          <button onClick={() => handleEdit(user)}>Edit</button>

          <button
            onClick={() => handleDelete(user.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>

          <button
            onClick={() => toggleStatus(user.id)}
            style={{ marginLeft: "10px" }}
          >
            Toggle Status
          </button>
        </div>
      ))}

      {/* Pagination */}
      <div style={{ marginTop: "20px" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 15px" }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      <hr />

      {/* Activity Log */}
      <h2>📜 Activity Log</h2>

      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          border: "1px solid gray",
          padding: "10px",
        }}
      >
        {activityLog.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          activityLog.map((log) => (
            <div key={log.id}>
              <strong>{log.action}</strong> - {log.user}
              <br />
              <small>{log.timestamp}</small>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
