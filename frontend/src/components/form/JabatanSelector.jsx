import React from 'react';

// Komponen rekursif untuk setiap node dalam tree
const JabatanNode = ({ node, level, selectedUser, onUserChange }) => {
    const indentStyle = { marginLeft: `${level * 20}px` };

    return (
        <div style={indentStyle} className="my-1">
            {/* Tampilkan nama jabatan */}
            <p className="font-semibold text-gray-600">{node.nama_jabatan}</p>

            {/* Tampilkan daftar pengguna di bawah jabatan ini */}
            <div className="pl-4 border-l-2 border-gray-200">
                {node.users && node.users.length > 0 ? (
                    node.users.map(user => (
                        <label key={user.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-indigo-50">
                            <input
                                type="radio"
                                name="assigned_to"
                                value={user.id}
                                checked={selectedUser == user.id}
                                onChange={onUserChange}
                                className="form-radio h-4 w-4 text-indigo-600"
                            />
                            <span className="text-gray-800">{user.name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 italic">Tidak ada pengguna</p>
                )}
            </div>

            {/* Panggil diri sendiri untuk setiap anak (children) */}
            {node.children && node.children.map(childNode => (
                <JabatanNode
                    key={childNode.id}
                    node={childNode}
                    level={level + 1}
                    selectedUser={selectedUser}
                    onUserChange={onUserChange}
                />
            ))}
        </div>
    );
};


// Komponen utama sebagai wrapper
const JabatanSelector = ({ jabatanTree, selectedUser, onChange }) => {
    const handleUserChange = (e) => {
        // Teruskan event ke parent component (RencanaAksiModal)
        onChange(e);
    };

    return (
        <div className="border rounded-md p-2 max-h-60 overflow-y-auto bg-gray-50">
            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-indigo-50">
                <input
                    type="radio"
                    name="assigned_to"
                    value="" // Opsi untuk tidak memilih siapa pun
                    checked={!selectedUser}
                    onChange={handleUserChange}
                    className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-500 italic">-- Tidak Ditugaskan --</span>
            </label>

            {jabatanTree.map(node => (
                <JabatanNode
                    key={node.id}
                    node={node}
                    level={0}
                    selectedUser={selectedUser}
                    onUserChange={handleUserChange}
                />
            ))}
        </div>
    );
};

export default JabatanSelector;
