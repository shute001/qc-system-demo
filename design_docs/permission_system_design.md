# Permission & Menu Control System Design Document

**Version**: 2.0 (Updated based on actual implementation)  
**Last Updated**: 2025-12-11

## 1. Overview

This document provides a **complete** specification for the Permission and Menu Control module of the Quality Control (QC) System. It is designed to guide developers through implementing a database-driven Role-Based Access Control (RBAC) system.

**System Capabilities**:
- ✅ Dynamic menu rendering based on user roles
- ✅ Hierarchical menu structure (unlimited depth)
- ✅ Role-based access control
- ✅ Efficient tree-building algorithm (O(n))
- ✅ Clean API separation (Auth vs Menu)

**Tech Stack**:
- **Frontend**: React.js + TypeScript + Ant Design
- **Backend**: Java Spring Boot + JPA
- **Database**: PostgreSQL
- **Architecture**: RESTful API with JWT authentication

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```mermaid
erDiagram
    SYS_USER ||--o{ SYS_USER_ROLE : has
    SYS_ROLE ||--o{ SYS_USER_ROLE : has
    SYS_ROLE ||--o{ SYS_ROLE_MENU : has
    SYS_MENU ||--o{ SYS_ROLE_MENU : has
    SYS_MENU ||--o{ SYS_MENU : "parent_id"
    SYS_BUSINESS ||--o{ SYS_PROCESS : owns
    SYS_USER ||--o{ SYS_USER_PROCESS : has
    SYS_PROCESS ||--o{ SYS_USER_PROCESS : has
```

### 2.2 Table Definitions

#### `sys_user` - User Accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique ID |
| `staff_id` | VARCHAR(50) | UNIQUE, NOT NULL | |
| `staff_name` | VARCHAR(100) | | Display name |
| `email` | VARCHAR(100) | | Email address |
| `status` | INTEGER | DEFAULT 1 | 1=Active, 0=Disabled |
| `manager_id` | UUID | FK to `sys_user(id)` | Line manager reference |
| `created_by` | VARCHAR(50) | | Created by |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |
| `updated_by` | VARCHAR(50) | | Updated by |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### `sys_role` - Roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique ID |
| `role_name` | VARCHAR(50) | NUNIQUE, NOT NULL | Role identifier (e.g., "admin", "M1", "staff") |
| `role_desc` | VARCHAR(100) | | Role description |
| `status` | INTEGER | DEFAULT 1 | 1=Active, 0=Disabled |
| `created_by` | VARCHAR(50) | | Created by |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |
| `updated_by` | VARCHAR(50) | | Updated by |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

**Important**: When serializing to JSON, the `menus` relationship should use `@JsonIgnore` to avoid data duplication with dedicated menu API.

#### `sys_menu` - Menus & Permissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `menu_id` | BIGSERIAL | PRIMARY KEY | Auto-increment menu ID |
| `menu_name` | VARCHAR(50) | NOT NULL | Menu label (e.g., "Dashboard") |
| `parent_id` | BIGINT | DEFAULT 0 | Parent menu ID (0 = root level) |
| `order_num` | INTEGER | DEFAULT 0 | Display order (ascending) |
| `path` | VARCHAR(255) | | Frontend route path |
| `component` | VARCHAR(255) | | React component path |
| `menu_type` | CHAR(1) | | 'D'=Directory, 'C'=Menu, 'F'=Button |
| `perms` | VARCHAR(100) | | Permission string (e.g., "qc:sampling:list") |
| `icon` | VARCHAR(100) | | Ant Design icon name (e.g., "DashboardOutlined") |
| `visible` | INTEGER | DEFAULT 1 | 1=Visible, 0=Hidden |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |

**Menu Types**:
- **D** (Directory): Parent menu with children (e.g., "QC Module")
- **C** (Component): Clickable menu item (e.g., "Sampling")
- **F** (Function): Button-level permission (e.g., "Approve")

#### `sys_user_role` - User-Role Association

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PRIMARY KEY, FK | References sys_user(id) |
| `role_id` | UUID | PRIMARY KEY, FK | References sys_role(id) |

**Composite Primary Key**: (`user_id`, `role_id`)

#### `sys_role_menu` - Role-Menu Association

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `role_id` | UUID | PRIMARY KEY, FK | References sys_role(id) |
| `menu_id` | UUID | PRIMARY KEY, FK | References sys_menu(id) |

**Composite Primary Key**: (`role_id`, `menu_id`)


#### `sys_business` - Business Units

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique ID |
| `business_code` | VARCHAR(50) | UNIQUE, NOT NULL | Business unit code (e.g., COL, UWS, etc.) |
| `business_name` | VARCHAR(100) | NOT NULL | Business unit name (e.g., Collections, etc.) |
| `status` | INTEGER | DEFAULT 1 | 1=Active, 0=Disabled |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |

#### `sys_process` - Process lines under Business

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique ID |
| `business_id` | UUID | PRIMARY KEY, FK | References sys_business(id) |
| `proc_aid` | VARCHAR(50) | NOT NULL | Process Aid (e.g., "NHI25", etc.) |
| `proc_name` | VARCHAR(100) | NOT NULL | Process name (e.g., "Collections Onshore", etc.) |
| `qlty_target` | INTEGER | DEFAULT 0 | Quality target |
| `status` | INTEGER | DEFAULT 1 | 1=Active, 0=Disabled |
| `created_by` | VARCHAR(50) | | Created by |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |
| `updated_by` | VARCHAR(50) | | Updated by |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

#### `sys_user_process` - User-Process Association

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PRIMARY KEY, FK | References sys_user(id) |
| `process_id` | UUID | PRIMARY KEY, FK | References sys_process(id) |

**Composite Primary Key**: (`user_id`, `process_id`)

---

## 3. API Specification

All APIs use standard REST conventions with JSON request/response bodies.

### 3.1 Authentication APIs

#### GET `/api/auth/info`

**Purpose**: Get current user information and roles

**Query Parameters**:
- `username` (string, required): Username to lookup

**Request Example**:
```http
GET /api/auth/info?username=admin
```

**Response** (200 OK):
```json
{
  "userId": 1,
  "username": "admin",
  "password": "$2a$10$...",
  "realName": "System Admin",
  "email": null,
  "avatar": null,
  "status": 1,
  "deptId": null,
  "managerId": null,
  "createdAt": "2025-12-10T19:49:16.495564",
  "updatedAt": "2025-12-10T19:49:16.495564",
  "roles": [
    {
      "roleId": 1,
      "roleName": "Administrator",
      "roleKey": "admin",
      "status": 1,
      "createdAt": "2025-12-10T19:49:16.495564"
    }
  ]
}
```

**Key Points**:
- ✅ Returns user basic information
- ✅ Includes `roles` array with role details
- ❌ **Does NOT** include menus (see dedicated menu API)
- `password` field contains BCrypt hash (should be filtered in production)

---

### 3.2 Menu APIs

#### GET `/api/menu/user/{username}`

**Purpose**: Get hierarchical menu tree for specific user based on their roles

**Path Parameters**:
- `username` (string, required): Username to lookup

**Request Example**:
```http
GET /api/menu/user/admin
```

**Response** (200 OK) - **Hierarchical Tree Structure**:
```json
[
  {
    "menuId": 1,
    "menuName": "Dashboard",
    "parentId": 0,
    "orderNum": 1,
    "path": "/dashboard",
    "component": "Dashboard",
    "menuType": "C",
    "perms": "dashboard:view",
    "icon": "DashboardOutlined",
    "visible": 1,
    "createdAt": "2025-12-10T19:49:16.495564",
    "children": []
  },
  {
    "menuId": 10,
    "menuName": "QC Management",
    "parentId": 0,
    "orderNum": 3,
    "path": "/qc-module",
    "component": null,
    "menuType": "M",
    "perms": null,
    "icon": "FileProtectOutlined",
    "visible": 1,
    "createdAt": "2025-12-10T19:49:16.495564",
    "children": [
      {
        "menuId": 11,
        "menuName": "Sampling",
        "parentId": 10,
        "orderNum": 1,
        "path": "sampling",
        "component": "qc/Sampling",
        "menuType": "C",
        "perms": "qc:sampling:list",
        "icon": null,
        "visible": 1,
        "createdAt": "2025-12-10T19:49:16.495564",
        "children": []
      },
      {
        "menuId": 14,
        "menuName": "Inbox (To QC)",
        "parentId": 10,
        "orderNum": 2,
        "path": "qc-inbox",
        "component": "qc/SamplingPage",
        "menuType": "C",
        "perms": "qc:inbox:list",
        "icon": null,
        "visible": 1,
        "createdAt": "2025-12-10T23:08:15.704505",
        "children": []
      }
    ]
  }
]
```

**Key Points**:
- ✅ Returns **hierarchical tree structure** (not flat list)
- ✅ Backend builds tree using O(n) algorithm
- ✅ Menus already **filtered by user's roles**
- ✅ Sorted by `order_num` (recursive)
- ✅ Supports **unlimited depth** (2, 3, 4+ levels)
- `children` array contains nested menus

**Backend Logic**:
1. Get user's role IDs from `sys_user_role`
2. Query menus assigned to those roles from `sys_role_menu`
3. Build hierarchical tree from flat list
4. Sort recursively by `order_num`
5. Return tree structure

---

#### GET `/api/menu/list`

**Purpose**: Get all menus (admin only, for management)

**Response** (200 OK):
```json
[
  {
    "menuId": 1,
    "menuName": "Dashboard",
    "parentId": 0,
    ...
  }
]
```

**Note**: Returns flat list, not tree structure

---

## 4. Menu Configuration Guide

### 4.1 Adding New Menus

**Step 1**: Insert menu record
```sql
INSERT INTO sys_menu (
    menu_name, parent_id, order_num, path, 
    component, menu_type, perms, icon, visible
) VALUES (
    'New Feature',  -- menu_name
    0,              -- parent_id (0 = root level)
    7,              -- order_num (display order)
    '/new-feature', -- path (frontend route)
    'NewFeature',   -- component (React component)
    'C',            -- menu_type (C = menu item)
    'feature:view', -- perms (permission string)
    'StarOutlined', -- icon (Ant Design icon name)
    1               -- visible (1 = visible)
);
```

**Step 2**: Assign to roles
```sql
-- Assign to admin role (role_id = 1)
INSERT INTO sys_role_menu (role_id, menu_id) 
VALUES (1, <new_menu_id>);

-- Assign to manager role (role_id = 2)
INSERT INTO sys_role_menu (role_id, menu_id) 
VALUES (2, <new_menu_id>);
```

### 4.2 Creating Multi-Level Menus

**Example**: Add 3-level menu structure

```sql
-- Level 1: Parent directory
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, menu_type, icon, visible)
VALUES ('System Settings', 0, 10, '/settings', 'M', 'SettingOutlined', 1)
RETURNING menu_id; -- Returns: 100

-- Level 2: Sub-category
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, menu_type, visible)
VALUES ('User Management', 100, 1, 'users', 'settings/UserManagement', 'C', 1)
RETURNING menu_id; -- Returns: 101

-- Level 3: Specific features
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, menu_type, perms, visible)
VALUES ('User List', 101, 1, 'list', 'settings/users/UserList', 'C', 'user:list', 1);

INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, menu_type, perms, visible)
VALUES ('Add User', 101, 2, 'add', 'settings/users/AddUser', 'C', 'user:add', 1);
```

**Result Structure**:
```
System Settings (L1)
  └─ User Management (L2)
      ├─ User List (L3)
      └─ Add User (L3)
```

### 4.3 Complete Role Configuration Example

**Scenario**: Configure menus for "QC Manager" role

```sql
-- 1. Create role
INSERT INTO sys_role (role_name, role_key, status)
VALUES ('QC Manager', 'qc_manager', 1)
RETURNING role_id; -- Returns: 4

-- 2. Assign menus to role
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(4, 1),   -- Dashboard
(4, 2),   -- My Workspace
(4, 3),   -- Analytics
(4, 10),  -- QC Module (parent)
(4, 11),  -- - Sampling
(4, 14),  -- - Inbox
(4, 15),  -- - Drafts
(4, 16),  -- - Outbox
(4, 17),  -- - Dispute
(4, 18);  -- - History

-- 3. Assign role to user
INSERT INTO sys_user_role (user_id, role_id)
VALUES (5, 4); -- User ID 5 becomes QC Manager
```

### 4.4 Menu Configuration Best Practices

1. **Order Numbers**:
   - Use increments of 1 or 10 for flexibility
   - Leave gaps for future insertions

2. **Path Convention**:
   - Root level: `/path` (leading slash)
   - Sub-levels: `subpath` (no leading slash)
   - Example: `/qc-module` → `sampling`

3. **Icon Names**:
   - Use Ant Design icon names: `DashboardOutlined`, `FileProtectOutlined`
   - Check: https://ant.design/components/icon

4. **Permission Strings**:
   - Format: `module:resource:action`
   - Example: `qc:sampling:list`, `qc:sampling:add`

5. **Menu Types**:
   - Use 'M' for categories with children
   - Use 'C' for clickable menu items
   - Use 'F' for button-level permissions

---

## 5. Backend Implementation

### 5.1 Entity Classes

#### SysMenu.java

```java
@Data
@Entity
@Table(name = "sys_menu")
public class SysMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;
    
    @Column(name = "menu_name", nullable = false)
    private String menuName;
    
    @Column(name = "parent_id")
    private Long parentId;
    
    @Column(name = "order_num")
    private Integer orderNum;
    
    private String path;
    private String component;
    private String menuType;
    private String perms;
    private String icon;
    private Integer visible;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // For tree structure (NOT persisted to database)
    @Transient
    private List<SysMenu> children = new ArrayList<>();
}
```

#### SysRole.java

```java
@Data
@Entity
@Table(name = "sys_role")
public class SysRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;
    
    @Column(name = "role_name", nullable = false)
    private String roleName;
    
    @Column(name = "role_key", nullable = false, unique = true)
    private String roleKey;
    
    private Integer status;
    private LocalDateTime createdAt;
    
    // JsonIgnore prevents menu serialization in /auth/info
    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sys_role_menu",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "menu_id")
    )
    private Set<SysMenu> menus = new HashSet<>();
}
```

### 5.2 Tree Building Algorithm

```java
/**
 * Converts flat menu list to hierarchical tree.
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
private List<SysMenu> buildMenuTree(List<SysMenu> flatList) {
    Map<Long, SysMenu> menuMap = new HashMap<>();
    List<SysMenu> roots = new ArrayList<>();
    
    // First pass: Create map and initialize children
    for (SysMenu menu : flatList) {
        menuMap.put(menu.getMenuId(), menu);
        menu.setChildren(new ArrayList<>());
    }
    
    // Second pass: Build parent-child relationships
    for (SysMenu menu : flatList) {
        if (menu.getParentId() == 0 || menu.getParentId() == null) {
            roots.add(menu);
        } else {
            SysMenu parent = menuMap.get(menu.getParentId());
            if (parent != null) {
                parent.getChildren().add(menu);
            }
        }
    }
    
    // Sort all levels by order_num
    sortMenusByOrder(roots);
    
    return roots;
}

/**
 * Recursively sorts menus by order_num
 */
private void sortMenusByOrder(List<SysMenu> menus) {
    menus.sort(Comparator.comparing(
        SysMenu::getOrderNum,
        Comparator.nullsLast(Comparator.naturalOrder())
    ));
    
    for (SysMenu menu : menus) {
        if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
            sortMenusByOrder(menu.getChildren());
        }
    }
}
```

### 5.3 Controller Example

```java
@RestController
@RequestMapping("/api/menu")
public class SysMenuController {
    
    @Autowired
    private SysMenuService menuService;
    
    @Autowired
    private SysUserService userService;
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<SysMenu>> getMenusForUser(
        @PathVariable String username
    ) {
        SysUser user = userService.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        List<SysMenu> flatMenus;
        
        // Admin gets all menus
        if (user.getUserId() == 1L) {
            flatMenus = menuService.findAll();
        } else {
            // Get role IDs
            Set<Long> roleIds = user.getRoles().stream()
                .map(SysRole::getRoleId)
                .collect(Collectors.toSet());
            
            // Get menus for roles
            flatMenus = menuService.findByRoleIds(roleIds);
        }
        
        // Build tree and return
        List<SysMenu> menuTree = buildMenuTree(flatMenus);
        return ResponseEntity.ok(menuTree);
    }
}
```

---

## 6. Frontend Implementation

### 6.1 Store Setup (Zustand)

```typescript
interface AppState {
    token: string | null;
    isAuthenticated: boolean;
    currentUser: User | null;
    menuTree: MenuItem[];
    
    login: (username: string) => Promise<void>;
    logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    currentUser: null,
    menuTree: [],
    
    login: async (username) => {
        // 1. Login
        const { token } = await authApi.login({ username, password: 'password123' });
        localStorage.setItem('token', token);
        
        // 2. Get user info
        const userInfo = await authApi.getUserInfo(username);
        
        // 3. Get menus (tree structure)
        const menus = await menuApi.getRouters(username);
        
        // 4. Extract role from roles array
        const roleKey = userInfo.roles?.[0]?.roleKey;
        const role = normalizeRole(roleKey);
        
        // 5. Set state
        set({ 
            token, 
            isAuthenticated: true, 
            currentUser: { ...userInfo, role },
            menuTree: menus 
        });
    },
    
    logout: () => {
        localStorage.removeItem('token');
        set({ 
            token: null, 
            isAuthenticated: false, 
            currentUser: null, 
            menuTree: [] 
        });
    }
}));
```

### 6.2 Menu Rendering (MainLayout)

```typescript
const MainLayout = ({ children }) => {
    const { menuTree } = useAppStore();
    
    // Icon mapping
    const iconMap: Record<string, React.ReactNode> = {
        'DashboardOutlined': <DashboardOutlined />,
        'FileProtectOutlined': <FileProtectOutlined />,
        'TeamOutlined': <TeamOutlined />,
        // ... add all used icons
    };
    
    // Convert backend tree to Ant Design format
    const convertBackendMenu = (items: MenuItem[]): any[] => {
        return items.map((it) => {
            // Remove leading slash from path
            let path = it.path || String(it.menuId);
            if (path.startsWith('/')) {
                path = path.substring(1);
            }
            
            return {
                key: path,
                label: it.menuName,
                icon: it.icon && iconMap[it.icon],
                // Recursively convert children
                children: it.children?.length > 0 
                    ? convertBackendMenu(it.children) 
                    : undefined
            };
        });
    };
    
    const menuItems = menuTree.length > 0 
        ? convertBackendMenu(menuTree) 
        : staticFallbackMenu;
    
    return (
        <Layout>
            <Sider>
                <Menu
                    mode="inline"
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Content>{children}</Content>
        </Layout>
    );
};
```

---

## 7. Testing Guide

### 7.1 Backend API Testing

**Test Menu API Returns Tree**:
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/api/menu/user/admin" | 
    Select-Object -ExpandProperty Content | 
    ConvertFrom-Json | 
    ConvertTo-Json -Depth 5

# Expected: Should see "children" arrays nested in response
```

**Test Role Filtering**:
```bash
# Admin should see all menus
GET /api/menu/user/admin

# Staff should see limited menus
GET /api/menu/user/alice
```

### 7.2 Frontend Testing

1. **Login Flow**:
   - Clear localStorage: `localStorage.clear()`
   - Navigate to `localhost:5173`
   - Should show login page
   - Login with different users

2. **Menu Display**:
   - Admin: Should see all menus
   - Manager: Should see manager menus
   - Staff: Should see limited menus

3. **Menu Navigation**:
   - Click all menu items
   - Verify correct page loads

---

## 8. Migration Scripts

### 8.1 Initial Setup (V1)

```sql
-- V1__init_rbac.sql
CREATE TABLE sys_user (...);
CREATE TABLE sys_role (...);
CREATE TABLE sys_menu (...);
CREATE TABLE sys_user_role (...);
CREATE TABLE sys_role_menu (...);

-- Seed data
INSERT INTO sys_role (role_name, role_key) VALUES
('Administrator', 'admin'),
('QC Manager', 'manager'),
('QC Staff', 'staff');

-- Create admin user
INSERT INTO sys_user (username, password, real_name) 
VALUES ('admin', '$2a$10$...', 'System Admin');
```

### 8.2 Complete Menu Setup (V2)

```sql
-- V2__add_complete_menus.sql
-- Clear old associations
DELETE FROM sys_role_menu;

-- Insert all menus with proper hierarchy
INSERT INTO sys_menu (...) VALUES (...);

-- Assign menus to roles
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(1, 1), (1, 2), (1, 3), ...; -- Admin gets all

INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(2, 1), (2, 2), ...; -- Manager subset

INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(3, 1), (3, 2), ...; -- Staff subset
```

---

## 9. Troubleshooting

### Issue: Menu not displaying after login

**Cause**: Old token in localStorage  
**Solution**: Clear localStorage: `localStorage.clear()`

### Issue: Sub-menus not showing

**Cause**: Backend not returning tree structure  
**Solution**: Verify `buildMenuTree` is called in controller

### Issue: Wrong role displayed

**Cause**: Role mapping incorrect  
**Solution**: Check `normalizeRole` function in frontend

### Issue: Menu data in /auth/info

**Cause**: Missing `@JsonIgnore` on SysRole.menus  
**Solution**: Add `@JsonIgnore` annotation

---

## 10. Future Enhancements

1. **Button-Level Permissions**: Use `menu_type='F'` for fine-grained control
2. **Dynamic Routing**: Generate routes from menu tree
3. **Menu Caching**: Cache menu trees on backend
4. **Permission Strings**: Add permission checking hooks
5. **Menu Editor UI**: Build admin interface for menu management

---

## Appendix A: Complete Menu Configuration Example

See database migration file `V2__add_complete_menus.sql` for production-ready example with all current menus configured.

## Appendix B: API Response Examples

Full response examples are documented in sections 3.1 and 3.2 above.
